const express = require('express');
const router = express.Router();
const {
    login,
    register,
} = require('../controller/AuthController.js');
const limiter = require('../middleware/RateLimiting.js');

//ROUTE
router.post("/login", limiter, login);
router.post("/register", limiter, register);

module.exports = router;