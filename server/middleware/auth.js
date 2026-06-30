const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'jwt_secret_fallback_key_12345');

      if (process.env.USE_MOCK_DB === 'true') {
        // Retrieve mock user from routes store
        const { mockUsers } = require('../routes/auth');
        const mockUser = mockUsers.find(u => u._id === decoded.id);
        if (!mockUser) {
          return res.status(401).json({ success: false, message: 'Not authorized, mock user not found' });
        }
        req.user = { id: mockUser._id, name: mockUser.name, email: mockUser.email };
        return next();
      }

      // Get user from the token, exclude password
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
