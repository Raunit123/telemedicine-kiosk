const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { username, password, fullName, village, age, gender, bloodGroup, knownConditions, currentMedications } = req.body;

  try {
    const normalizedUsername = username.trim(); // Remove spaces

    console.log("Checking if user exists:", normalizedUsername);

    // Check if user exists (case-insensitive)
    const existingUser = await User.findOne({ username: normalizedUsername });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user object
    const newUser = new User({
      username: normalizedUsername,
      password, // No need to hash manually (schema handles it)
      fullName,
      village,
      age: Number(age),
      gender,
      bloodGroup,
      knownConditions,
      currentMedications
    });

    await newUser.save();
    console.log("User created successfully:", normalizedUsername);

    // Generate JWT Token
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(201).json({ message: 'User created successfully', token });
  } catch (err) {
    console.error("Error during signup:", err.message);

    if (err.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation failed', 
        error: err.message
      });
    }

    res.status(500).json({ message: 'Error creating user', error: err.message });
  }
});

// Login Route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const normalizedUsername = username.trim();

    // Find user by username
    const user = await User.findOne({ username: normalizedUsername });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid password' });
    }

    // Generate JWT Token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err.message });
  }
});

module.exports = router;