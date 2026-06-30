const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { protect } = require('../middleware/auth');

// In-memory Database Store for Resumes Fallback
const mockResumes = [];

// Helper to verify if mock DB should be used
const useMock = () => process.env.USE_MOCK_DB === 'true';

// @desc    Get all resumes for logged-in user
// @route   GET /api/resumes
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    if (useMock()) {
      const userResumes = mockResumes.filter(r => r.user === req.user.id);
      // Sort by updatedAt descending
      userResumes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      return res.json({ success: true, count: userResumes.length, data: userResumes });
    }

    // Standard MongoDB Flow
    const resumes = await Resume.find({ user: req.user.id }).sort({ updatedAt: -1 });
    res.json({ success: true, count: resumes.length, data: resumes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get single resume details
// @route   GET /api/resumes/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    if (useMock()) {
      const resume = mockResumes.find(r => r._id === req.params.id);

      if (!resume) {
        return res.status(404).json({ success: false, message: 'Resume not found' });
      }

      // Verify ownership
      if (resume.user !== req.user.id) {
        return res.status(401).json({ success: false, message: 'Not authorized to view this resume' });
      }

      return res.json({ success: true, data: resume });
    }

    // Standard MongoDB Flow
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Verify ownership
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to view this resume' });
    }

    res.json({ success: true, data: resume });
  } catch (error) {
    console.error(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create new resume
// @route   POST /api/resumes
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const resumeData = req.body;
    resumeData.user = req.user.id;

    if (!resumeData.title) {
      resumeData.title = 'My Professional Resume';
    }

    if (!resumeData.personalInfo) {
      resumeData.personalInfo = {
        name: req.user.name || '',
        email: req.user.email || '',
        phone: '',
        website: '',
        github: '',
        linkedin: '',
        summary: '',
      };
    } else {
      if (!resumeData.personalInfo.name) resumeData.personalInfo.name = req.user.name || '';
      if (!resumeData.personalInfo.email) resumeData.personalInfo.email = req.user.email || '';
    }

    if (useMock()) {
      const mockResume = {
        _id: 'mock_resume_' + Date.now(),
        ...resumeData,
        updatedAt: new Date(),
      };
      mockResumes.push(mockResume);
      return res.status(201).json({ success: true, data: mockResume });
    }

    // Standard MongoDB Flow
    const resume = await Resume.create(resumeData);
    res.status(201).json({ success: true, data: resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update resume details
// @route   PUT /api/resumes/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    if (useMock()) {
      const index = mockResumes.findIndex(r => r._id === req.params.id);

      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Resume not found' });
      }

      // Verify ownership
      if (mockResumes[index].user !== req.user.id) {
        return res.status(401).json({ success: false, message: 'Not authorized to update this resume' });
      }

      mockResumes[index] = {
        ...mockResumes[index],
        ...req.body,
        _id: req.params.id, // Ensure ID is not mutated
        user: req.user.id,  // Ensure user association remains intact
        updatedAt: new Date(),
      };

      return res.json({ success: true, data: mockResumes[index] });
    }

    // Standard MongoDB Flow
    let resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Verify ownership
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to update this resume' });
    }

    req.body.updatedAt = Date.now();

    resume = await Resume.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: resume });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete resume
// @route   DELETE /api/resumes/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    if (useMock()) {
      const index = mockResumes.findIndex(r => r._id === req.params.id);

      if (index === -1) {
        return res.status(404).json({ success: false, message: 'Resume not found' });
      }

      // Verify ownership
      if (mockResumes[index].user !== req.user.id) {
        return res.status(401).json({ success: false, message: 'Not authorized to delete this resume' });
      }

      mockResumes.splice(index, 1);
      return res.json({ success: true, message: 'Resume deleted successfully' });
    }

    // Standard MongoDB Flow
    const resume = await Resume.findById(req.params.id);

    if (!resume) {
      return res.status(404).json({ success: false, message: 'Resume not found' });
    }

    // Verify ownership
    if (resume.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this resume' });
    }

    await Resume.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
