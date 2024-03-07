const express = require('express');
const { UserController, decodeFromToken } = require('../controllers/userController');
const RestaurantController = require('../controllers/restaurantController');
const ProfileController = require('../controllers/profileController');
const PairController = require('../controllers/pairController');

const router = express.Router();

router.post('/api/user', UserController.createUser);
router.put('/api/user/auth', UserController.authenticateUser);
router.get('/api/user/auth',UserController.verifyUser);

module.exports = router;
