const router = require('express').Router();
const authorsController = require('../../controllers/authorsController');

// Matches with "/api/authors"
router
  .route('/')
  .get(authorsController.getAuthorInfo);

module.exports = router;
