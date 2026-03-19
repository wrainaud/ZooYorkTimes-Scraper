const router = require('express').Router();
const articleRoutes = require('./articles');
const authorRoutes = require('./authors');

// Article routes
router.use('/saved', articleRoutes);

// Author routes
router.use('/authors', authorRoutes);

module.exports = router;
