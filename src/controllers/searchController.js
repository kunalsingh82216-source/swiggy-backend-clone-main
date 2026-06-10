const Restaurant = require('../models/Restaurant');

// Advanced Search with Filters
exports.searchRestaurants = async (req, res) => {
  try {
    const {
      q,                    // search query (name, cuisine)
      city,
      cuisine,
      minRating,
      maxDeliveryTime,
      isVeg,
      priceRange,
      sortBy,               // rating, deliveryTime, popularity
      page = 1,
      limit = 20
    } = req.query;

    // Build search query
    const query = { isApproved: true };

    // Text search (name, cuisine)
    if (q) {
      query.$text = { $search: q };
    }

    // City filter
    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    // Cuisine filter
    if (cuisine) {
      query.cuisine = { $regex: cuisine, $options: 'i' };
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Delivery time filter
    if (maxDeliveryTime) {
      query.deliveryTime = { $lte: parseInt(maxDeliveryTime) };
    }

    // Veg filter
    if (isVeg === 'true') {
      query.isVeg = true;
    }

    // Price range filter
    if (priceRange) {
      query.priceRange = priceRange;
    }

    // Sorting
    let sort = {};
    switch (sortBy) {
      case 'rating':
        sort = { rating: -1 };
        break;
      case 'deliveryTime':
        sort = { deliveryTime: 1 };
        break;
      case 'popularity':
        sort = { orderCount: -1 };
        break;
      default:
        sort = { rating: -1 };
    }

    // Pagination
    const skip = (page - 1) * limit;
    
    const restaurants = await Restaurant.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Restaurant.countDocuments(query);

    res.json({
      success: true,
      data: restaurants,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      filters: { q, city, cuisine, minRating, maxDeliveryTime, isVeg, priceRange, sortBy }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Fuzzy Search (spelling mistakes allowed)
exports.fuzzySearch = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query required' });
    }

    // Create fuzzy regex pattern
    const fuzzyPattern = q.split('').join('.*');
    
    const restaurants = await Restaurant.find({
      isApproved: true,
      $or: [
        { name: { $regex: fuzzyPattern, $options: 'i' } },
        { cuisine: { $regex: fuzzyPattern, $options: 'i' } },
        { city: { $regex: fuzzyPattern, $options: 'i' } }
      ]
    }).limit(20);

    res.json({
      success: true,
      count: restaurants.length,
      data: restaurants,
      searchTerm: q
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const restaurant = await Restaurant.findById(id);
    
    if (!restaurant) {
      return res.status(404).json({ success: false, message: 'Restaurant not found' });
    }

    res.json({ success: true, data: restaurant });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all unique cuisines (for filters)
exports.getCuisines = async (req, res) => {
  try {
    const cuisines = await Restaurant.distinct('cuisine', { isApproved: true });
    res.json({ success: true, data: cuisines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all cities (for filters)
exports.getCities = async (req, res) => {
  try {
    const cities = await Restaurant.distinct('city', { isApproved: true });
    res.json({ success: true, data: cities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};