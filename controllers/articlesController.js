const mongoose = require('mongoose');

// Use native MongoDB driver via Mongoose connection to avoid triggering Mongoose Document internals
function getCollection() {
  return mongoose.connection.collection('articles'); // matches Mongoose model's default collection name
}

// Defining methods for the articlesController
module.exports = {
  findAll: function(req, res) {
    try {
      const coll = getCollection();
      const cursor = coll.find(req.query || {}).sort({ date: -1 });
      cursor.toArray((err, docs) => {
        if (err) return res.status(500).json({ error: 'Failed to load saved articles', details: err.message || err });
        return res.json(docs);
      });
    } catch (err) {
      return res.status(500).json({ error: 'Failed to load saved articles', details: err && err.message ? err.message : err });
    }
  },
  create: function(req, res) {
    try {
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

      const coll = getCollection();
      // Idempotent upsert without using findAndModify/Document paths
      coll.updateOne(
        { url: url },
        { $setOnInsert: doc },
        { upsert: true },
        (err, result) => {
          if (err) {
            console.error('Save article failed:', err && (err.stack || err.message || err));
            return res.status(422).json({ error: 'Could not save article', details: err && err.message ? err.message : err });
          }
          if (result && (result.upsertedCount === 1 || (result.result && result.result.upserted))) {
            // Newly created
            return coll.findOne({ url: url }, (findErr, created) => {
              if (findErr) return res.status(201).json({});
              return res.status(201).json(created || {});
            });
          }
          // Already existed; return existing doc (OK)
          return coll.findOne({ url: url }, (findErr, existing) => {
            if (findErr) return res.status(200).json({});
            return res.status(200).json(existing || {});
          });
        }
      );
    } catch (err) {
      res.status(500).json({ error: 'Unexpected server error', details: err && err.message ? err.message : err });
    }
  },
  remove: function(req, res) {
    try {
      const id = req.params.id;
      const coll = getCollection();
      const { ObjectId } = mongoose.Types;
      let _id;
      try {
        _id = new ObjectId(id);
      } catch (e) {
        return res.status(400).json({ error: 'Delete failed', details: 'Invalid article id' });
      }
      coll.findOneAndDelete({ _id }, (err, result) => {
        if (err) return res.status(500).json({ error: 'Delete failed', details: err && err.message ? err.message : err });
        if (!result || !result.value) return res.status(404).json({ error: 'Delete failed', details: 'Article not found' });
        return res.json(result.value);
      });
    } catch (err) {
      return res.status(500).json({ error: 'Delete failed', details: err && err.message ? err.message : err });
    }
  }
};
