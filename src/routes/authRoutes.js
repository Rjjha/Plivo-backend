const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  register,
  login,
  getCurrentUser,
  logout,
  updateProfile,
  changePassword
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.use(auth);

router.get('/me', getCurrentUser);
router.post('/logout', logout);
router.put('/profile', updateProfile);
router.put('/password', changePassword);

module.exports = router;
