const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { uploadImage, uploadPdf } = require('../middleware/upload');

// In-memory Database Store for Fallback Mode
const mockUsers = [];

// Helper to construct JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'jwt_secret_fallback_key_12345', {
    expiresIn: '30d',
  });
};

// Helper to verify if mock DB should be used
const useMock = () => process.env.USE_MOCK_DB === 'true';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all fields' });
    }

    if (useMock()) {
      const userExists = mockUsers.find(u => u.email === email);
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      // Hash password manually for mock
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const mockUser = {
        _id: 'mock_user_' + Date.now(),
        name,
        email,
        password: hashedPassword,
        profileImage: '',
        resumePdf: '',
        createdAt: new Date(),
      };

      mockUsers.push(mockUser);

      return res.status(201).json({
        success: true,
        data: {
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          profileImage: mockUser.profileImage,
          resumePdf: mockUser.resumePdf,
          token: generateToken(mockUser._id),
        },
      });
    }

    // Standard MongoDB Flow
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        resumePdf: user.resumePdf,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (useMock()) {
      const mockUser = mockUsers.find(u => u.email === email);
      if (!mockUser) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, mockUser.password);
      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      return res.json({
        success: true,
        data: {
          _id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          profileImage: mockUser.profileImage,
          resumePdf: mockUser.resumePdf,
          token: generateToken(mockUser._id),
        },
      });
    }

    // Standard MongoDB Flow
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage: user.profileImage,
        resumePdf: user.resumePdf,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get logged in user profile
// @route   GET /api/auth/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    if (useMock()) {
      const mockUser = mockUsers.find(u => u._id === req.user.id);
      if (mockUser) {
        return res.json({
          success: true,
          data: {
            _id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email,
            profileImage: mockUser.profileImage,
            resumePdf: mockUser.resumePdf,
          },
        });
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Standard MongoDB Flow
    const user = await User.findById(req.user.id);
    if (user) {
      res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage,
          resumePdf: user.resumePdf,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user profile (name, password)
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, password } = req.body;

    if (useMock()) {
      const mockUser = mockUsers.find(u => u._id === req.user.id);
      if (mockUser) {
        mockUser.name = name || mockUser.name;
        if (password) {
          const salt = await bcrypt.genSalt(10);
          mockUser.password = await bcrypt.hash(password, salt);
        }

        return res.json({
          success: true,
          data: {
            _id: mockUser._id,
            name: mockUser.name,
            email: mockUser.email,
            profileImage: mockUser.profileImage,
            resumePdf: mockUser.resumePdf,
          },
        });
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Standard MongoDB Flow
    const user = await User.findById(req.user.id);
    if (user) {
      user.name = name || user.name;
      if (password) {
        user.password = password;
      }

      const updatedUser = await user.save();
      res.json({
        success: true,
        data: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          profileImage: updatedUser.profileImage,
          resumePdf: updatedUser.resumePdf,
        },
      });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper to construct URL for locally uploaded file
const getUploadedFileUrl = (req, file) => {
  if (file.path && file.path.startsWith('http')) {
    return file.path;
  }
  return `${req.protocol}://${req.get('host')}/uploads/${file.filename}`;
};

// @desc    Upload profile image
// @route   POST /api/auth/upload-image
// @access  Private
router.post('/upload-image', protect, uploadImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image file' });
    }

    const imageUrl = getUploadedFileUrl(req, req.file);

    if (useMock()) {
      const mockUser = mockUsers.find(u => u._id === req.user.id);
      if (mockUser) {
        mockUser.profileImage = imageUrl;
        return res.json({ success: true, data: { profileImage: imageUrl } });
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Standard MongoDB Flow
    const user = await User.findById(req.user.id);
    user.profileImage = imageUrl;
    await user.save();

    res.json({ success: true, data: { profileImage: imageUrl } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Upload resume PDF
// @route   POST /api/auth/upload-pdf
// @access  Private
router.post('/upload-pdf', protect, uploadPdf, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
    }

    const pdfUrl = getUploadedFileUrl(req, req.file);

    if (useMock()) {
      const mockUser = mockUsers.find(u => u._id === req.user.id);
      if (mockUser) {
        mockUser.resumePdf = pdfUrl;
        return res.json({ success: true, data: { resumePdf: pdfUrl } });
      }
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Standard MongoDB Flow
    const user = await User.findById(req.user.id);
    user.resumePdf = pdfUrl;
    await user.save();

    res.json({ success: true, data: { resumePdf: pdfUrl } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
module.exports.mockUsers = mockUsers; // Export for auth middleware mock reference
