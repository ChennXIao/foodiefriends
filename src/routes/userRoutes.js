const express = require('express');
const { UserController } = require('../controllers/userController');
const router = express.Router();

router.post('/api/user', UserController.createUser);
router.put('/api/user/auth', UserController.authenticateUser);
router.get('/api/user/auth',UserController.verifyUser);

module.exports = router;
