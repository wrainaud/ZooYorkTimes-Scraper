const axios = require('axios');

// NYT Article Search API base URL
const NYT_API_BASE_URL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json';

module.exports = {
  // Fetch author information for an article
  // Query params: author (required), api-key (required)
  getAuthorInfo: function(req, res) {
    const { author } = req.query;
    const apiKey = req.query['api-key'] || process.env.NYT_API_KEY;
    const secretKey = process.env.NYT_SECRET_KEY;

    if (!author) {
      return res.status(400).json({ error: 'Author name is required' });
    }

    if (!apiKey) {
      return res.status(400).json({ error: 'NYT API key is required. Provide it via api-key query param or NYT_API_KEY environment variable' });
    }

    const headers = {};
    if (secretKey) {
      headers['X-NYT-Secret'] = secretKey;
    }

    // Search for articles by the specified author
    axios.get(NYT_API_BASE_URL, {
      params: {
        'fq': `byline:("${author}")`,
        'api-key': apiKey
      },
      headers
    })
      .then(response => {
        const articles = response.data.response.docs;
        
        // Extract unique author information from articles
        const authorInfo = {
          author: author,
          articleCount: articles.length,
          articles: articles.map(article => ({
            headline: article.headline.main,
            byline: article.byline ? article.byline.original : null,
            pubDate: article.pub_date,
            webUrl: article.web_url,
            snippet: article.snippet,
            section: article.section_name
          }))
        };

        res.json(authorInfo);
      })
      .catch(err => {
        console.error('Error fetching author info from NYT API:', err.message);
        res.status(500).json({ 
          error: 'Failed to fetch author information from NYT API',
          details: err.response ? err.response.data : err.message
        });
      });
  }
};
