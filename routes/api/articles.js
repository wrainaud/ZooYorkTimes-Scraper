const router = require('express').Router();
const articlesController = require('../../controllers/articlesController');

// Matches with "/api/saved"
router
  .route('/')
  .get(articlesController.findAll)
  .post(articlesController.create);

// Matches with "/api/saved/search"
router
  .route('/search')
  .get(articlesController.nytSearch);

// Matches with "/api/saved/report"
router
  .route('/report')
  .get(articlesController.generateReport);

// Matches with "/api/saved/:id"
router
  .route('/:id')
  .delete(articlesController.remove);

module.exports = router;
