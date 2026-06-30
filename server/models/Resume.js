const mongoose = require('mongoose');

const ResumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Please add a resume title'],
    default: 'My Resume',
  },
  personalInfo: {
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    website: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    summary: { type: String, default: '' },
  },
  education: [
    {
      school: { type: String, default: '' },
      degree: { type: String, default: '' },
      fieldOfStudy: { type: String, default: '' },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      description: { type: String, default: '' },
    },
  ],
  experience: [
    {
      company: { type: String, default: '' },
      position: { type: String, default: '' },
      location: { type: String, default: '' },
      startDate: { type: String, default: '' },
      endDate: { type: String, default: '' },
      current: { type: Boolean, default: false },
      description: { type: String, default: '' },
    },
  ],
  projects: [
    {
      title: { type: String, default: '' },
      role: { type: String, default: '' },
      description: { type: String, default: '' },
      link: { type: String, default: '' },
      technologies: { type: [String], default: [] },
    },
  ],
  skills: {
    technical: { type: [String], default: [] },
    soft: { type: [String], default: [] },
  },
  certifications: [
    {
      name: { type: String, default: '' },
      issuer: { type: String, default: '' },
      date: { type: String, default: '' },
      link: { type: String, default: '' },
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Resume', ResumeSchema);
