const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Import User model

const protect = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: 'Authorization denied. No token provided.' 
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists (critical for rural kiosk shared devices)
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'User no longer exists.' 
      });
    }

    // Attach full user data to request (for medical history/access control)
    req.user = user;
    next();
  } catch (err) {
    // Handle token expiration specifically
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Session expired. Please log in again.' 
      });
    }
    
    res.status(401).json({ 
      success: false,
      error: 'Invalid token.' 
    });
  }
};

module.exports = protect;
