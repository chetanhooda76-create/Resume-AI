const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { protect } = require('../middleware/auth');

const isGeminiConfigured = !!(
  process.env.GEMINI_API_KEY && 
  process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY' &&
  process.env.GEMINI_API_KEY.trim() !== ''
);

let genAI;
let model;

if (isGeminiConfigured) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    console.log('Google Gemini AI initialized successfully.');
  } catch (error) {
    console.error('Failed to initialize Google Gemini AI:', error.message);
  }
} else {
  console.log('Gemini API Key not set. Running AI Assistant in simulator mode.');
}

// Helper function to call Gemini with a prompt
const callGemini = async (prompt, systemInstruction = '') => {
  if (isGeminiConfigured && model) {
    try {
      const fullPrompt = systemInstruction 
        ? `${systemInstruction}\n\nUser Input: ${prompt}` 
        : prompt;
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini API Error (falling back to simulator):', error.message);
      return null;
    }
  } else {
    // Simulator helper
    return null;
  }
};

// @desc    Generate professional profile summary
// @route   POST /api/ai/summary
// @access  Private
router.post('/summary', protect, async (req, res) => {
  try {
    const { experienceDetails, targetRole } = req.body;

    if (!experienceDetails) {
      return res.status(400).json({ success: false, message: 'Please provide experience details' });
    }

    const systemInstruction = 'You are a professional resume writer. Write a compelling, concise 3-4 sentence professional summary based on the provided experience details and target role. Do not include introductory text, headers, or explanations. Start directly with the summary.';
    const prompt = `Target Role: ${targetRole || 'Professional'}\nDetails: ${experienceDetails}`;

    let aiResult = await callGemini(prompt, systemInstruction);

    if (!aiResult) {
      // Simulate response
      aiResult = `Results-oriented ${targetRole || 'Professional'} with hands-on experience in ${experienceDetails.substring(0, 50)}... Proven track record of delivering high-quality solutions, optimizing workflows, and collaborating in team environments to achieve key milestones. Adept at leveraging modern technologies and industry best practices to drive successful project outcomes.`;
    }

    res.json({ success: true, summary: aiResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Improve existing resume content
// @route   POST /api/ai/improve
// @access  Private
router.post('/improve', protect, async (req, res) => {
  try {
    const { text, type } = req.body; // type can be 'experience', 'projects', 'summary', etc.

    if (!text) {
      return res.status(400).json({ success: false, message: 'Please provide text to improve' });
    }

    const systemInstruction = 'You are an elite career consultant and executive resume editor. Revise the provided text to make it sound highly professional, action-oriented, and impactful. Use strong action verbs and remove passive phrasing. Keep the format concise (e.g., bullet points or a single paragraph based on input). Do not include any chat conversational text or introduction.';
    const prompt = `Type: ${type || 'general'}\nText to improve: ${text}`;

    let aiResult = await callGemini(prompt, systemInstruction);

    if (!aiResult) {
      // Simulate response
      if (type === 'experience' || text.startsWith('-') || text.includes('\n')) {
        aiResult = `• Spearheaded development of core features, boosting overall application performance and reliability.\n• Collaborated cross-functionally to refine workflows and integrate scalable APIs.\n• Implemented robust solutions that directly enhanced user retention and reduced latency.`;
      } else {
        aiResult = `Highly accomplished professional, recognized for delivering high-impact contributions in key initiatives. Effectively coordinates across diverse stakeholders to streamline processes, utilize advanced methodologies, and execute complex goals on schedule.`;
      }
    }

    res.json({ success: true, improvedText: aiResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Generate project descriptions
// @route   POST /api/ai/projects
// @access  Private
router.post('/projects', protect, async (req, res) => {
  try {
    const { title, technologies, roleDescription } = req.body;

    if (!title) {
      return res.status(400).json({ success: false, message: 'Please provide project title' });
    }

    const systemInstruction = 'You are a technical resume assistant. Write 3 highly descriptive bullet points outlining achievements, architectures, and technical metrics for the project details provided. Use action verbs and highlight the technologies used. Do not include markdown headers or extra conversational text.';
    const prompt = `Project Title: ${title}\nTechnologies: ${technologies || 'Relevant Stack'}\nRole/Duties: ${roleDescription || 'Developed key parts of the project'}`;

    let aiResult = await callGemini(prompt, systemInstruction);

    if (!aiResult) {
      // Simulate response
      aiResult = `• Engineered a full-stack application for ${title} using ${technologies || 'React and Node.js'}, enabling real-time data synchronization and interactive user flows.
• Designed and optimized relational/non-relational database schemas to handle complex operations and minimize API response times by 30%.
• Integrated key external API services and set up secure user authentication, improving data safety and client-side page load speed.`;
    }

    res.json({ success: true, projectDescription: aiResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Suggest technical and soft skills
// @route   POST /api/ai/skills
// @access  Private
router.post('/skills', protect, async (req, res) => {
  try {
    const { role } = req.body;

    if (!role) {
      return res.status(400).json({ success: false, message: 'Please provide job role' });
    }

    const systemInstruction = 'You are a career development specialist. Suggest 8 relevant technical skills and 5 relevant soft skills for a given job role. Output the response strictly as a JSON object with keys "technical" (array of strings) and "soft" (array of strings). Do not include markdown code block formatting (like ```json), just output the raw JSON string.';
    const prompt = `Job Role: ${role}`;

    let aiResult = await callGemini(prompt, systemInstruction);
    let skillsObj;

    if (aiResult) {
      try {
        // Strip out code block delimiters if AI returned them
        const cleanJson = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
        skillsObj = JSON.parse(cleanJson);
      } catch (err) {
        console.error('Failed to parse AI skills JSON, returning fallback:', err);
      }
    }

    if (!skillsObj) {
      // Simulate response
      const isTech = role.toLowerCase().includes('engineer') || role.toLowerCase().includes('developer') || role.toLowerCase().includes('tech') || role.toLowerCase().includes('coder');
      
      if (isTech) {
        skillsObj = {
          technical: ['JavaScript (ES6+)', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'REST APIs', 'Git/GitHub', 'Tailwind CSS'],
          soft: ['Problem Solving', 'Team Collaboration', 'Effective Communication', 'Time Management', 'Critical Thinking'],
        };
      } else {
        skillsObj = {
          technical: ['Project Management', 'Data Analysis', 'Market Research', 'Microsoft Office Excel', 'CRM Software', 'Social Media Analytics', 'Report Writing', 'Public Speaking'],
          soft: ['Leadership', 'Adaptability', 'Active Listening', 'Conflict Resolution', 'Negotiation'],
        };
      }
    }

    res.json({ success: true, skills: skillsObj });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Resume Writing Q&A Chat Assistant
// @route   POST /api/ai/chat
// @access  Private
router.post('/chat', protect, async (req, res) => {
  try {
    const { message, chatHistory } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Please provide a message' });
    }

    let prompt = '';
    const systemInstruction = 'You are "Antigravity Resume AI Assistant", an expert career mentor and resume strategist. Offer constructive, highly encouraging, and specific advice to the user. Answer their questions regarding resume formats, descriptions, skills gap, interviews, and portfolio builders. Keep answers well-structured and easy to read with bullet points where appropriate.';

    if (chatHistory && chatHistory.length > 0) {
      const historyStr = chatHistory.map(h => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n');
      prompt = `Conversation History:\n${historyStr}\n\nNew Question: ${message}`;
    } else {
      prompt = message;
    }

    let aiResult = await callGemini(prompt, systemInstruction);

    if (!aiResult) {
      // Simulate chat responses
      const msgLower = message.toLowerCase();
      if (msgLower.includes('experience') || msgLower.includes('work')) {
        aiResult = `To write a strong experience section:
1. **Focus on achievements, not just tasks.** Instead of "responsible for coding", write "Developed 5 key React components, reducing load time by 15%."
2. **Start with strong action verbs.** Use words like *Spearheaded*, *Implemented*, *Optimized*, and *Collaborated*.
3. **Use the STAR method:** Describe the **S**ituation, **T**ask, **A**ction, and **R**esult.
4. **Quantify results whenever possible** (e.g., % improvement, hours saved, dollars earned).`;
      } else if (msgLower.includes('format') || msgLower.includes('layout')) {
        aiResult = `For standard professional resumes, the **Reverse-Chronological format** is highly recommended by recruiters:
- **Order:** Contact Details -> Professional Summary -> Experience -> Projects -> Education -> Skills.
- **Length:** Try to keep it to exactly **one page** if you have less than 5 years of experience.
- **Font & Margins:** Use clean sans-serif typography (like Inter, Roboto, or Lato), set font sizes between 10-12pt, and margins to 0.75 or 1 inch.
- **PDF:** Always export as PDF to maintain the formatting across all ATS systems and devices.`;
      } else {
        aiResult = `Hello! I am your Antigravity Resume Assistant. I would be happy to help you build a standout resume. 

Here are some quick guidelines:
- Make sure to add **impactful project bullets** emphasizing the tech stack used.
- Ensure your **professional summary** is tailored to the job description you are targeting.
- Keep your **skills list organized** by categories (e.g., frontend, backend, tools, databases).

What specific section or topic would you like to refine next?`;
      }
    }

    res.json({ success: true, reply: aiResult });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
