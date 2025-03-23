


// routes/userRoutes.js
const express = require('express');
const { UserController, decodeFromToken } = require('../controllers/userController');
const RestaurantController = require('../controllers/restaurantController');
const ProfileController = require('../controllers/profileController');
const PairController = require('../controllers/pairController');


const router = express.Router();

// Define user routes
router.post('/api/user', UserController.createUser);
router.put('/api/user/auth', UserController.authenticateUser);
router.get('/api/user/auth',UserController.verifyUser);

// router.get('/api/restaurant',RestaurantController.getRestaurant);

router.get('/api/restaurants/user/:userId', RestaurantController.getRestaurantsByUser);
router.get('/api/restaurants/:restaurantId', RestaurantController.getRestaurantById);

router.post('/api/restaurants',RestaurantController.addRestaurant);
router.post('/api/restaurants/batch',RestaurantController.addRestaurants);
router.put('/api/restaurants',RestaurantController.updateUserRestaurant);

router.get('/api/likes/liked',RestaurantController.getLiked);
router.get('/api/likes/others',RestaurantController.likeOthers);

router.get('/api/likedrestaurant',PairController.getLikedRestaurant);
router.get('/api/currentuser',ProfileController.getCurrentUserProfileAndFilter);


router.post('/api/profile',ProfileController.createProfile);
router.get('/api/profile/:id',ProfileController.checkProfile);
router.put('/api/profile',ProfileController.updateProfile);

router.get('/api/filter',RestaurantController.checkFilter);
router.put('/api/filter',RestaurantController.createFilter);

router.post('/api/day',RestaurantController.createDay);
router.get('/api/day',RestaurantController.getDay);
router.put('/api/day',RestaurantController.updateDay);


router.put('/api/date',RestaurantController.createDate);
router.get('/api/date',RestaurantController.getDate);

router.post('/api/matches',PairController.makePair);
router.put('/api/matches',PairController.updatePair);

// router.get('/api/pairs',PairController.checkPair);
router.get('/api/matches',PairController.getMatches);
router.delete('/api/matches/:id',PairController.cancelDate);

router.get('/api/pairs',PairController.checkPair);

module.exports = router;
