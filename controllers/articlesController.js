const Article = require('../models/article');
const axios = require('axios');

// NYT Article Search API base URL
const NYT_API_BASE_URL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';

// Defining methods for the articlesController
module.exports = {
  nytSearch: function(req, res) {
    const { q, begin_date, end_date, author, type } = req.query;
    const apiKey = process.env.NYT_API_KEY || process.env.REACT_APP_NYT_API_KEY;
    const secretKey = process.env.NYT_SECRET_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'NYT API key is not configured on the server.' });
    }

    const params = {
      q,
      'api-key': apiKey
    };

    const headers = {};
    if (secretKey) {
      headers['X-NYT-Secret'] = secretKey;
    }

    if (begin_date) params.begin_date = begin_date;
    if (end_date) params.end_date = end_date;

    // Build filter query (fq) for advanced search
    const filters = [];
    if (author) {
      filters.push(`person:("${author}")`);
    }
    if (type && type !== 'all') {
      // Map our simple type names to NYT's type_of_material values
      const typeMap = {
        'article': 'News',
        'book': 'Review',
        'multimedia': 'Multimedia'
      };
      const nytType = typeMap[type] || type;
      filters.push(`type_of_material:("${nytType}")`);
    }
    if (filters.length > 0) {
      params.fq = filters.join(' AND ');
    }

    axios.get(NYT_API_BASE_URL, { params, headers })
      .then(response => res.json(response.data))
      .catch(err => {
        console.error('NYT API Error:', err.message);
        res.status(err.response ? err.response.status : 500).json({
          error: 'Failed to fetch from NYT API',
          details: err.response ? err.response.data : err.message
        });
      });
  },
  findAll: function(req, res) {
    // Whitelist-based filter to avoid NoSQL operator injection via req.query
    const filter = {};
    if (req && req.query) {
      const { title, url, date } = req.query;
      if (typeof title === 'string' && title.trim()) filter.title = title.trim();
      if (typeof url === 'string' && url.trim()) filter.url = url.trim();
      if (date) {
        const ts = Date.parse(date);
        if (!Number.isNaN(ts)) {
          // Example: filter by exact date (day). For more complex ranges, implement safely server-side.
          const d = new Date(ts);
          const start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const end = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
          filter.date = { $gte: start, $lt: end };
        }
      }
    }

    Article.find(filter)
      .sort({ date: -1 })
      .then(dbArticles => res.json(dbArticles))
      .catch(err => res.status(422).json(err));
  },
  create: function(req, res) {
    const payload = req.body || {};
    let { title, url, date } = payload;

    if (typeof title === 'string') title = title.trim();
    if (typeof url === 'string') url = url.trim();

    if (!title || !url) {
      return res.status(400).json({ error: 'Invalid request', message: 'Both title and url are required.' });
    }

    // Coerce/clean date: if provided but not parseable, drop it
    if (date) {
      const ts = Date.parse(date);
      if (Number.isNaN(ts)) {
        date = undefined;
      } else {
        date = new Date(ts);
      }
    }

    const doc = { title, url };
    if (date) doc.date = date;

    // Idempotent upsert
    Article.findOneAndUpdate(
      { url: url },
      { $setOnInsert: doc },
      { upsert: true, new: true, runValidators: true }
    )
      .then(dbArticle => res.json(dbArticle))
      .catch(err => {
        console.error('Save article failed:', err);
        res.status(422).json(err);
      });
  },
  remove: function(req, res) {
    Article.findById(req.params.id)
      .then(dbArticle => {
        if (!dbArticle) {
          return res.status(404).json({ error: 'Delete failed', details: 'Article not found' });
        }
        return dbArticle.deleteOne();
      })
      .then(dbArticle => res.json(dbArticle))
      .catch(err => res.status(422).json(err));
  },
  generateReport: function(req, res) {
    const format = req.query.format || "csv";

    Article.find({})
      .sort({ date: -1 })
      .then(docs => {
        if (format === "json") {
          return res.json({
            generatedAt: new Date().toISOString(),
            totalArticles: docs.length,
            articles: docs.map(d => ({
              title: d.title,
              url: d.url,
              date: d.date
            }))
          });
        }

        // Default to CSV
        let csv = "Title,URL,Date\n";
        docs.forEach(d => {
          const title = (d.title || "").replace(/"/g, '""');
          const url = (d.url || "").replace(/"/g, '""');
          const date = d.date ? new Date(d.date).toISOString() : "";
          csv += `"${title}","${url}","${date}"\n`;
        });

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=articles-report.csv");
        return res.status(200).send(csv);
      })
      .catch(err => {
        console.error("Report generation failed:", err);
        res.status(500).json({ error: "Failed to generate report", details: err.message });
      });
  }
};
