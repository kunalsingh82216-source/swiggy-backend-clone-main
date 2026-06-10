const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');

// Public routes (no authentication needed)
router.get('/restaurants', searchController.searchRestaurants);
router.get('/fuzzy', searchController.fuzzySearch);
router.get('/restaurants/:id', searchController.getRestaurantById);
router.get('/cuisines', searchController.getCuisines);
router.get('/cities', searchController.getCities);

module.exports = router;