# AI Resume & Portfolio Builder

A high-fidelity full-stack MERN (MongoDB, Express, React, Node.js) application that allows users to create, manage, style, and export professional resumes. It integrates Google Gemini AI to assist with generating summaries, improving experience descriptions, suggesting skills, and answering career questions via an interactive chat drawer.

The project is designed with a modern, glassmorphic dark-mode UI using **React (Vite)** and **Tailwind CSS v4** on the frontend, and a modular **Node/Express** backend API.

---

## 🚀 Key Features

* **Full Authentication Flow**: Secure sign-up, login, and JWT-authenticated session persistence.
* **Dashboard Widgets**: A resume catalog and profile completeness tracker to check off tasks (e.g., uploading a profile picture, adding skills, filling in summaries).
* **Live Split-Screen Resume Builder**: A detailed form editor on the left side with a real-time, pixel-perfect preview canvas on the right.
* **Resume Design Templates**: Switch between multiple styling templates on-the-fly:
  * *Modern*: Colorful, progressive, and clean.
  * *Professional*: Sleek, serif-styled, and structured for traditional industries.
  * *Minimalist*: Compact, neat, and highly readable.
* **Google Gemini AI Integration**:
  * *Summary Generator*: Input brief experiences to construct a refined executive summary.
  * *Description Improver*: Refine text and project descriptions into action-oriented bullet points.
  * *Skills Suggestion*: Generates relevant hard and soft skills based on job titles.
  * *QA Career Coach*: Talk to an interactive resume advisor directly inside the builder drawer.
* **High-Fidelity PDF Export**: Prints the template canvas directly to a clean PDF using `html2canvas` + `jsPDF`.
* **Flexible Fallbacks (Zero-Configuration Setup)**:
  * *Mock In-Memory DB*: Automatically boots up if MongoDB is offline or unconfigured.
  * *AI Chat Simulator*: Simulates AI answers if the Gemini API key is missing, enabling immediate preview without API keys.
  * *Local Upload Fallback*: Automatically stores uploaded images and resumes locally if Cloudinary environment keys are not supplied.

---

## 📁 Directory Structure

```
AI-resume/
├── client/                 # React Frontend (Vite)
│   ├── public/             # Static assets & SVG icon sprites
│   ├── src/
│   │   ├── components/     # Navbar, ProtectedRoute, AIAssistant drawer
│   │   ├── context/        # Auth global state provider
│   │   ├── pages/          # Login, Register, Dashboard, Profile, ResumeBuilder
│   │   ├── services/       # Axios API client setup
│   │   ├── index.css       # Tailwind CSS v4 styling rules
│   │   ├── App.jsx         # App routes config
│   │   └── main.jsx        # App entry point
│   ├── package.json
│   └── vite.config.js      # Vite compilation with Tailwind CSS v4 plugin
│
└── server/                 # Express Backend
    ├── config/             # DB & Cloudinary storage setups
    ├── middleware/         # Token validation & upload configurations
    ├── models/             # Mongoose schemas (User, Resume)
    ├── routes/             # API Endpoints (auth, resume, ai)
    ├── uploads/            # Local storage fallback directory
    ├── index.js            # Node Entry Point
    └── package.json
```

---

## 🛠️ Setup & Installation

Follow these steps to run the application locally:

### Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** or **yarn**
* (Optional) **MongoDB** instance running locally or on Atlas. (The server will automatically switch to in-memory mock mode if not present).

### 1. Configure the Backend

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Open or create a `.env` file in the `server` directory and fill in your configurations:
   ```env
   PORT=5001
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key

   # MongoDB Connection String (leave blank or invalid to use in-memory mock database)
   MONGO_URI=mongodb://127.0.0.1:27017/ai-resume-builder

   # Cloudinary Setup (leave blank to fallback to local uploads)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret

   # Gemini API Key (leave blank to run in simulated AI demo mode)
   GEMINI_API_KEY=your_gemini_api_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend will be running on `http://localhost:5001`.

---

### 2. Configure the Frontend

1. Navigate to the `client` directory:
   ```bash
   cd ../client
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the client development server:
   ```bash
   npm run dev
   ```
   The frontend will be running on `http://localhost:5173`. Open this URL in your web browser.

---

## 👥 Inviting Collaborators

This repository is ready for collaborative development! To work with friends on GitHub:

1. Push this codebase to your remote GitHub repository:
   ```bash
   git remote add origin <YOUR_GITHUB_REPO_URL>
   git branch -M main
   git push -u origin main
   ```
2. Open the repository on GitHub in your browser.
3. Select the **Settings** tab.
4. Click on **Collaborators** on the left menu.
5. Click **Add people**, type your friend's GitHub username/email, and send the invitation.
