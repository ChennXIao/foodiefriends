const express = require('express');
const RestaurantController = require('../controllers/restaurantController');
const ProfileController = require('../controllers/profileController');
const PairController = require('../controllers/pairController');
const router = express.Router();

router.get('/api/restaurants/user/:userId', RestaurantController.getRestaurantsByUser);
router.get('/api/restaurants/:restaurantId', RestaurantController.getRestaurantById);

router.post('/api/restaurants',RestaurantController.addRestaurant);
router.post('/api/restaurants/batch',RestaurantController.addRestaurants);
router.put('/api/restaurants',RestaurantController.updateUserRestaurant);

router.get('/api/likes/liked',RestaurantController.getLiked);
router.get('/api/likes/others',RestaurantController.likeOthers);

router.get('/api/likedrestaurant',PairController.getLikedRestaurant);
router.get('/api/currentuser',ProfileController.getCurrentUserProfileAndFilter);

module.exports = router;
