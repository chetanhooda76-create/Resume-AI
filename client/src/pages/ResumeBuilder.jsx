import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../services/api';
import AIAssistant from '../components/AIAssistant';
import { 
  Sparkles, Save, FileDown, Plus, Trash2, ArrowLeft,
  ChevronDown, ChevronUp, Briefcase, GraduationCap,
  Wrench, FolderGit2, Milestone, UserCheck, Bot
} from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';

const ResumeBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const previewRef = useRef(null);

  // Resume State
  const [title, setTitle] = useState('');
  const [personalInfo, setPersonalInfo] = useState({
    name: '', email: '', phone: '', website: '', github: '', linkedin: '', summary: ''
  });
  const [education, setEducation] = useState([]);
  const [experience, setExperience] = useState([]);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState({ technical: [], soft: [] });
  const [certifications, setCertifications] = useState([]);
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('personal'); // personal, education, experience, projects, skills, certifications
  const [selectedTemplate, setSelectedTemplate] = useState('modern'); // modern, professional, minimalist
  const [mobileView, setMobileView] = useState('edit'); // edit, preview
  const captureRef = useRef(null);

  const handleSelectTemplate = (temp) => {
    setSelectedTemplate(temp);
    localStorage.setItem(`resume_template_${id || 'new'}`, temp);
  };
  
  // AI Form states
  const [aiLoading, setAiLoading] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  
  // Technical & Soft skill input states
  const [techSkillInput, setTechSkillInput] = useState('');
  const [softSkillInput, setSoftSkillInput] = useState('');

  // Load Resume Details
  useEffect(() => {
    const fetchResume = async () => {
      const savedTemplate = localStorage.getItem(`resume_template_${id || 'new'}`);
      if (savedTemplate) {
        setSelectedTemplate(savedTemplate);
      }

      if (!id) {
        setLoading(false);
        return;
      }
      try {
        const res = await API.get(`/resumes/${id}`);
        if (res.data.success) {
          const data = res.data.data;
          setTitle(data.title || 'My Resume');
          setPersonalInfo(data.personalInfo || {});
          setEducation(data.education || []);
          setExperience(data.experience || []);
          setProjects(data.projects || []);
          setSkills(data.skills || { technical: [], soft: [] });
          setCertifications(data.certifications || []);
        }
      } catch (error) {
        console.error('Error fetching resume:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResume();
  }, [id]);

  const renderTemplateContent = () => {
    switch (selectedTemplate) {
      case 'modern':
        return (
          <div className="space-y-6">
            {/* Header */}
            <div className="border-b-2 border-indigo-600 pb-4 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {personalInfo.name || 'Candidate Name'}
                </h1>
                <p className="text-xs text-indigo-600 font-semibold tracking-wider uppercase mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {targetRole || 'Professional'}
                </p>
              </div>
              <div className="text-right text-[9px] text-slate-500 space-y-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                {personalInfo.email && <div>{personalInfo.email}</div>}
                {personalInfo.phone && <div>{personalInfo.phone}</div>}
                {personalInfo.website && <div>{personalInfo.website}</div>}
                <div className="flex justify-end gap-2 mt-1">
                  {personalInfo.github && <span className="font-semibold text-slate-600">GH</span>}
                  {personalInfo.linkedin && <span className="font-semibold text-indigo-600">LI</span>}
                </div>
              </div>
            </div>

            {/* Summary */}
            {personalInfo.summary && (
              <div>
                <h3 className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>Professional Summary</h3>
                <p className="text-[10px] leading-relaxed text-slate-600">{personalInfo.summary}</p>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div>
                <h3 className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Work Experience</h3>
                <div className="space-y-4">
                  {experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-start">
                        <h4 className="text-[11px] font-bold text-slate-800">
                          {exp.position} <span className="font-normal text-slate-400">at</span> {exp.company}
                        </h4>
                        <span className="text-[9px] text-slate-500 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <div className="text-[8px] text-slate-400 mt-0.5">{exp.location}</div>
                      <p className="text-[9.5px] leading-relaxed text-slate-600 mt-1.5" style={{ whiteSpace: 'pre-line' }}>{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div>
                <h3 className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Key Projects</h3>
                <div className="space-y-4">
                  {projects.map((proj, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline">
                        <h4 className="text-[11px] font-bold text-slate-800">{proj.title}</h4>
                        {proj.link && <span className="text-[8px] text-slate-400">{proj.link}</span>}
                      </div>
                      <div className="text-[9px] font-semibold text-indigo-500 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Tech Stack: {proj.technologies.join(', ')}
                      </div>
                      <p className="text-[9.5px] leading-relaxed text-slate-600 mt-1" style={{ whiteSpace: 'pre-line' }}>{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Two Column Layout for education, skills, certs */}
            <div className="grid grid-cols-2 gap-6 pt-2 border-t border-slate-100">
              {/* Left Side: Education */}
              <div className="space-y-4">
                {education.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Education</h3>
                    <div className="space-y-3">
                      {education.map((edu, i) => (
                        <div key={i} className="text-[9.5px]">
                          <div className="font-bold text-slate-800">{edu.degree} in {edu.fieldOfStudy}</div>
                          <div className="text-slate-600">{edu.school}</div>
                          <div className="text-[8.5px] text-slate-400 mt-0.5">{edu.startDate} – {edu.endDate}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {certifications.length > 0 && (
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Certifications</h3>
                    <div className="space-y-2">
                      {certifications.map((cert, i) => (
                        <div key={i} className="text-[9.5px]">
                          <div className="font-bold text-slate-800">{cert.name}</div>
                          <div className="text-slate-500">{cert.issuer} • {cert.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Skills */}
              <div className="space-y-4">
                {(skills.technical.length > 0 || skills.soft.length > 0) && (
                  <div>
                    <h3 className="text-xs font-bold tracking-wider text-indigo-600 uppercase mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>Skills</h3>
                    {skills.technical.length > 0 && (
                      <div className="mb-3">
                        <h4 className="text-[9.5px] font-bold text-slate-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Technical Expertise</h4>
                        <p className="text-[9.5px] text-slate-600 leading-relaxed">{skills.technical.join(', ')}</p>
                      </div>
                    )}
                    {skills.soft.length > 0 && (
                      <div>
                        <h4 className="text-[9.5px] font-bold text-slate-800 mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Professional Competencies</h4>
                        <p className="text-[9.5px] text-slate-600 leading-relaxed">{skills.soft.join(', ')}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      case 'professional':
        return (
          <div className="space-y-5 text-slate-900">
            {/* Header */}
            <div className="text-center space-y-1">
              <h1 className="text-3xl font-bold tracking-wide uppercase">{personalInfo.name || 'Candidate Name'}</h1>
              <div className="flex justify-center flex-wrap gap-3 text-[10px] text-slate-600 font-medium">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.website && <span>• {personalInfo.website}</span>}
                {personalInfo.github && <span>• GH: {personalInfo.github}</span>}
                {personalInfo.linkedin && <span>• LI: {personalInfo.linkedin}</span>}
              </div>
            </div>

            {/* Summary */}
            {personalInfo.summary && (
              <div className="pt-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">Professional Profile</h3>
                <p className="text-[10px] leading-relaxed text-slate-700">{personalInfo.summary}</p>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2.5">Employment History</h3>
                <div className="space-y-3.5">
                  {experience.map((exp, i) => (
                    <div key={i}>
                      <div className="flex justify-between font-bold text-[10.5px]">
                        <span>{exp.position} – {exp.company}</span>
                        <span>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <div className="text-[8.5px] italic text-slate-500">{exp.location}</div>
                      <p className="text-[9.5px] leading-relaxed text-slate-700 mt-1" style={{ whiteSpace: 'pre-line' }}>{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2.5">Education</h3>
                <div className="space-y-2">
                  {education.map((edu, i) => (
                    <div key={i} className="flex justify-between text-[10px]">
                      <div>
                        <span className="font-bold">{edu.degree} in {edu.fieldOfStudy}</span>
                        <span className="text-slate-600"> — {edu.school}</span>
                      </div>
                      <span className="text-slate-500">{edu.startDate} – {edu.endDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2.5">Selected Projects</h3>
                <div className="space-y-3">
                  {projects.map((proj, i) => (
                    <div key={i}>
                      <div className="flex justify-between font-bold text-[10px]">
                        <span>{proj.title}</span>
                        {proj.link && <span className="font-normal text-slate-500 text-[9px]">{proj.link}</span>}
                      </div>
                      <div className="text-[9px] text-slate-500 italic mt-0.5">Technologies: {proj.technologies.join(', ')}</div>
                      <p className="text-[9.5px] leading-relaxed text-slate-750 mt-1" style={{ whiteSpace: 'pre-line' }}>{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {(skills.technical.length > 0 || skills.soft.length > 0) && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">Skills Inventory</h3>
                <div className="text-[10px] space-y-1.5">
                  {skills.technical.length > 0 && (
                    <div>
                      <span className="font-bold">Technical Skills:</span> {skills.technical.join(', ')}
                    </div>
                  )}
                  {skills.soft.length > 0 && (
                    <div>
                      <span className="font-bold">Soft Skills:</span> {skills.soft.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div>
                <h3 className="text-[11px] font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2">Certifications</h3>
                <ul className="list-disc list-inside text-[10px] space-y-1">
                  {certifications.map((cert, i) => (
                    <li key={i} className="text-slate-700">
                      <span className="font-bold">{cert.name}</span> — {cert.issuer} ({cert.date})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'minimalist':
        return (
          <div className="space-y-4 text-slate-900" style={{ fontFamily: 'sans-serif' }}>
            <div className="flex justify-between items-baseline border-b pb-2">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{personalInfo.name || 'Candidate Name'}</h1>
                <span className="text-[9.5px] font-semibold text-slate-500">{targetRole || 'Professional'}</span>
              </div>
              <div className="text-right text-[8.5px] text-slate-500 space-y-0.5">
                <div>{personalInfo.email}</div>
                <div>{personalInfo.phone}</div>
                <div>{personalInfo.website}</div>
              </div>
            </div>

            {personalInfo.summary && (
              <div className="text-[9.5px] leading-relaxed text-slate-600">{personalInfo.summary}</div>
            )}

            <div className="space-y-3 pt-2">
              {experience.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Experience</h3>
                  <div className="space-y-2">
                    {experience.map((exp, i) => (
                      <div key={i} className="text-[9.5px]">
                        <div className="flex justify-between font-bold">
                          <span>{exp.position} @ {exp.company}</span>
                          <span className="font-normal text-slate-400">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                        </div>
                        <p className="text-slate-600 mt-1" style={{ whiteSpace: 'pre-line' }}>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {education.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Education</h3>
                  {education.map((edu, i) => (
                    <div key={i} className="flex justify-between text-[9.5px] mb-1">
                      <span>{edu.degree} in {edu.fieldOfStudy} — {edu.school}</span>
                      <span className="text-slate-400">{edu.startDate} – {edu.endDate}</span>
                    </div>
                  ))}
                </div>
              )}

              {skills.technical.length > 0 && (
                <div>
                  <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Skills</h3>
                  <p className="text-[9.5px] text-slate-600">{skills.technical.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Save Resume Function
  const handleSave = async (showNotification = true) => {
    setSaving(true);
    try {
      const payload = {
        title,
        personalInfo,
        education,
        experience,
        projects,
        skills,
        certifications,
      };
      
      const res = await API.put(`/resumes/${id}`, payload);
      if (res.data.success && showNotification) {
        // Simple visual alert or state feedback
        console.log('Saved successfully');
      }
    } catch (error) {
      console.error('Error saving resume:', error);
    } finally {
      setSaving(false);
    }
  };

  // PDF Export Function
  const handleDownloadPDF = async () => {
    const element = captureRef.current;
    if (!element) return;

    try {
      // Capture the dedicated off-screen element directly at fixed A4 desktop size
      const canvas = await html2canvas(element, {
        scale: 2, // high resolution
        useCORS: true,
        backgroundColor: '#ffffff',
        width: 794,
        windowWidth: 794
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${personalInfo.name || 'Resume'}_AI.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF. Check console for details: ' + error.message);
    }
  };

  // AI Helpers
  const handleImproveSummary = async () => {
    if (!personalInfo.summary.trim()) return;
    setAiLoading(true);
    try {
      const res = await API.post('/ai/improve', {
        text: personalInfo.summary,
        type: 'summary'
      });
      if (res.data.success) {
        setPersonalInfo(prev => ({ ...prev, summary: res.data.improvedText }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setAiLoading(true);
    try {
      const details = `${personalInfo.name || 'Candidate'}. Experience: ${experience.map(exp => `${exp.position} at ${exp.company}`).join(', ')}. Skills: ${skills.technical.join(', ')}`;
      const res = await API.post('/ai/summary', {
        experienceDetails: details,
        targetRole: targetRole || 'Software Professional'
      });
      if (res.data.success) {
        setPersonalInfo(prev => ({ ...prev, summary: res.data.summary }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleImproveExperience = async (index) => {
    const text = experience[index].description;
    if (!text.trim()) return;
    setAiLoading(true);
    try {
      const res = await API.post('/ai/improve', { text, type: 'experience' });
      if (res.data.success) {
        const updated = [...experience];
        updated[index].description = res.data.improvedText;
        setExperience(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleGenerateProjectBullets = async (index) => {
    const proj = projects[index];
    if (!proj.title.trim()) return;
    setAiLoading(true);
    try {
      const res = await API.post('/ai/projects', {
        title: proj.title,
        technologies: proj.technologies.join(', '),
        roleDescription: proj.description
      });
      if (res.data.success) {
        const updated = [...projects];
        updated[index].description = res.data.projectDescription;
        setProjects(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSuggestSkills = async () => {
    if (!targetRole.trim()) return;
    setAiLoading(true);
    try {
      const res = await API.post('/ai/skills', { role: targetRole });
      if (res.data.success) {
        setSkills({
          technical: [...new Set([...skills.technical, ...res.data.skills.technical])],
          soft: [...new Set([...skills.soft, ...res.data.skills.soft])]
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  // Add/Remove Helpers
  const addEducation = () => {
    setEducation([...education, { school: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', description: '' }]);
  };
  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperience([...experience, { company: '', position: '', location: '', startDate: '', endDate: '', current: false, description: '' }]);
  };
  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addProject = () => {
    setProjects([...projects, { title: '', role: '', description: '', link: '', technologies: [] }]);
  };
  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  const addCert = () => {
    setCertifications([...certifications, { name: '', issuer: '', date: '', link: '' }]);
  };
  const removeCert = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-slate-950 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-slate-400">Loading resume workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-68px)] overflow-hidden bg-slate-950">
      {/* Mobile View Switcher (Sticky at the top, visible only on mobile/tablet) */}
      <div className="flex border-b border-slate-800 md:hidden bg-slate-950 p-3 gap-3 shrink-0">
        <button
          type="button"
          onClick={() => setMobileView('edit')}
          className={`flex-1 rounded-lg py-2 text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            mobileView === 'edit'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
          }`}
        >
          Form Editor
        </button>
        <button
          type="button"
          onClick={() => setMobileView('preview')}
          className={`flex-1 rounded-lg py-2 text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            mobileView === 'preview'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/50'
          }`}
        >
          Live Preview
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Workspace Panel */}
        <div className={`w-full flex-col border-r border-slate-800 bg-slate-900/40 md:flex md:w-1/2 overflow-y-auto ${mobileView === 'edit' ? 'flex' : 'hidden md:flex'}`}>
        {/* Workspace Toolbar */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent font-bold text-white text-base outline-none border-b border-transparent focus:border-slate-700 pb-0.5 max-w-[200px]"
              placeholder="Resume Name"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? 'Saving...' : 'Save'}
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:bg-indigo-500"
            >
              <FileDown className="h-3.5 w-3.5" />
              Download PDF
            </button>

            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-md hover:from-purple-500 hover:to-indigo-500"
            >
              <Bot className="h-3.5 w-3.5 animate-bounce" />
              Ask AI
            </button>
          </div>
        </div>



        {/* Section Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-800 px-4 py-2 bg-slate-950/40 scrollbar-none">
          {[
            { id: 'personal', label: 'Personal', icon: UserCheck },
            { id: 'experience', label: 'Experience', icon: Briefcase },
            { id: 'education', label: 'Education', icon: GraduationCap },
            { id: 'projects', label: 'Projects', icon: FolderGit2 },
            { id: 'skills', label: 'Skills', icon: Wrench },
            { id: 'certifications', label: 'Certifications', icon: Milestone },
          ].map((sec) => {
            const Icon = sec.icon;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all whitespace-nowrap ${
                  activeSection === sec.id
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Editor Workspace Forms */}
        <div className="flex-1 p-6 space-y-6">
          {/* PERSONAL INFO SECTION */}
          {activeSection === 'personal' && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white">Personal Information</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</label>
                  <input
                    type="text"
                    value={personalInfo.name || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</label>
                  <input
                    type="email"
                    value={personalInfo.email || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</label>
                  <input
                    type="text"
                    value={personalInfo.phone || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="+1 234 567 890"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Website</label>
                  <input
                    type="text"
                    value={personalInfo.website || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="johndoe.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">GitHub Link</label>
                  <input
                    type="text"
                    value={personalInfo.github || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="github.com/johndoe"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">LinkedIn Link</label>
                  <input
                    type="text"
                    value={personalInfo.linkedin || ''}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, linkedin: e.target.value })}
                    className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                    placeholder="linkedin.com/in/johndoe"
                  />
                </div>
              </div>

              {/* AI Professional Summary generator */}
              <div className="mt-6 border-t border-slate-800/80 pt-6">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Professional Summary</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleImproveSummary}
                      disabled={aiLoading || !personalInfo.summary}
                      className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                    >
                      <Sparkles className="h-3 w-3" />
                      AI Improve
                    </button>
                  </div>
                </div>
                <textarea
                  rows={4}
                  value={personalInfo.summary || ''}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                  className="mt-2 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                  placeholder="Summarize your professional experience..."
                />
              </div>

              {/* Generate summary from role */}
              <div className="mt-4 rounded-xl bg-slate-950 p-4 border border-indigo-500/10">
                <h4 className="flex items-center gap-1.5 font-bold text-xs text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Summary Generator
                </h4>
                <p className="mt-1 text-[10px] text-slate-500">Provide your target job role below to generate a new professional summary.</p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-900 p-2 text-[10px] text-white outline-none"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    disabled={aiLoading || !targetRole}
                    className="rounded-lg bg-indigo-600 px-3 text-[10px] font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* WORK EXPERIENCE SECTION */}
          {activeSection === 'experience' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Work Experience</h2>
                <button
                  type="button"
                  onClick={addExperience}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-indigo-400 hover:text-white"
                >
                  <Plus className="h-3 w-3" /> Add Experience
                </button>
              </div>

              {experience.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No experience history added yet.</p>
              )}

              {experience.map((exp, index) => (
                <div key={index} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 relative space-y-4">
                  <button
                    onClick={() => removeExperience(index)}
                    className="absolute right-4 top-4 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <h3 className="text-xs font-bold text-indigo-400">Position #{index + 1}</h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Company</label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[index].company = e.target.value;
                          setExperience(updated);
                        }}
                        className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                        placeholder="Google"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Position</label>
                      <input
                        type="text"
                        value={exp.position}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[index].position = e.target.value;
                          setExperience(updated);
                        }}
                        className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                        placeholder="Software Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Location</label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => {
                          const updated = [...experience];
                          updated[index].location = e.target.value;
                          setExperience(updated);
                        }}
                        className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                        placeholder="Mountain View, CA"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Date</label>
                        <input
                          type="text"
                          value={exp.startDate}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[index].startDate = e.target.value;
                            setExperience(updated);
                          }}
                          className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                          placeholder="June 2023"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">End Date</label>
                        <input
                          type="text"
                          disabled={exp.current}
                          value={exp.current ? 'Present' : exp.endDate}
                          onChange={(e) => {
                            const updated = [...experience];
                            updated[index].endDate = e.target.value;
                            setExperience(updated);
                          }}
                          className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none disabled:opacity-40"
                          placeholder="Dec 2025"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      id={`current-${index}`}
                      type="checkbox"
                      checked={exp.current}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[index].current = e.target.checked;
                        if (e.target.checked) updated[index].endDate = '';
                        setExperience(updated);
                      }}
                      className="rounded border-slate-800 text-indigo-600 bg-slate-950"
                    />
                    <label htmlFor={`current-${index}`} className="text-[10px] text-slate-400 font-semibold uppercase">I currently work here</label>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Responsibilities & Achievements</label>
                      <button
                        type="button"
                        onClick={() => handleImproveExperience(index)}
                        disabled={aiLoading || !exp.description}
                        className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                      >
                        <Sparkles className="h-3 w-3" />
                        AI Improve
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={exp.description}
                      onChange={(e) => {
                        const updated = [...experience];
                        updated[index].description = e.target.value;
                        setExperience(updated);
                      }}
                      className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                      placeholder="e.g. Developed and optimized scalable dashboard widgets..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* EDUCATION SECTION */}
          {activeSection === 'education' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Education History</h2>
                <button
                  type="button"
                  onClick={addEducation}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-indigo-400 hover:text-white"
                >
                  <Plus className="h-3 w-3" /> Add Education
                </button>
              </div>

              {education.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No education history added yet.</p>
              )}

              {education.map((edu, index) => (
                <div key={index} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 relative space-y-4">
                  <button
                    onClick={() => removeEducation(index)}
                    className="absolute right-4 top-4 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <h3 className="text-xs font-bold text-indigo-400">Education #{index + 1}</h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">School/University</label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].school = e.target.value;
                          setEducation(updated);
                        }}
                        className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                        placeholder="Stanford University"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Degree</label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].degree = e.target.value;
                          setEducation(updated);
                        }}
                        className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                        placeholder="Bachelor of Science"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Field of Study</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => {
                          const updated = [...education];
                          updated[index].fieldOfStudy = e.target.value;
                          setEducation(updated);
                        }}
                        className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                        placeholder="Computer Science"
                      />
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Start Date</label>
                        <input
                          type="text"
                          value={edu.startDate}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[index].startDate = e.target.value;
                            setEducation(updated);
                          }}
                          className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                          placeholder="Sept 2019"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">End Date</label>
                        <input
                          type="text"
                          value={edu.endDate}
                          onChange={(e) => {
                            const updated = [...education];
                            updated[index].endDate = e.target.value;
                            setEducation(updated);
                          }}
                          className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                          placeholder="June 2023"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROJECTS SECTION */}
          {activeSection === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Projects</h2>
                <button
                  type="button"
                  onClick={addProject}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-indigo-400 hover:text-white"
                >
                  <Plus className="h-3 w-3" /> Add Project
                </button>
              </div>

              {projects.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No projects added yet.</p>
              )}

              {projects.map((proj, index) => (
                <div key={index} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 relative space-y-4">
                  <button
                    onClick={() => removeProject(index)}
                    className="absolute right-4 top-4 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <h3 className="text-xs font-bold text-indigo-400">Project #{index + 1}</h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Project Title</label>
                      <input
                        type="text"
                        value={proj.title}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[index].title = e.target.value;
                          setProjects(updated);
                        }}
                        className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                        placeholder="E-Commerce API"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Project Link</label>
                      <input
                        type="text"
                        value={proj.link}
                        onChange={(e) => {
                          const updated = [...projects];
                          updated[index].link = e.target.value;
                          setProjects(updated);
                        }}
                        className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                        placeholder="github.com/myproject"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Technologies Used (Comma-separated)</label>
                    <input
                      type="text"
                      value={proj.technologies.join(', ')}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[index].technologies = e.target.value.split(',').map(s => s.trim());
                        setProjects(updated);
                      }}
                      className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                      placeholder="React, Node.js, Express, MongoDB"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Description / Achievements</label>
                      <button
                        type="button"
                        onClick={() => handleGenerateProjectBullets(index)}
                        disabled={aiLoading || !proj.title}
                        className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                      >
                        <Sparkles className="h-3 w-3" />
                        AI Generate Description
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={proj.description}
                      onChange={(e) => {
                        const updated = [...projects];
                        updated[index].description = e.target.value;
                        setProjects(updated);
                      }}
                      className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none focus:border-indigo-500"
                      placeholder="Provide brief details about the project and click AI Generate..."
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SKILLS SECTION */}
          {activeSection === 'skills' && (
            <div className="space-y-6">
              <h2 className="text-lg font-bold text-white">Skills</h2>
              
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Technical Skills */}
                <div className="glass-panel rounded-xl p-4 border border-slate-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Technical Skills</label>
                  
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={techSkillInput}
                      onChange={(e) => setTechSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && techSkillInput.trim()) {
                          e.preventDefault();
                          setSkills({ ...skills, technical: [...new Set([...skills.technical, techSkillInput.trim()])] });
                          setTechSkillInput('');
                        }
                      }}
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white outline-none"
                      placeholder="e.g. JavaScript"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (techSkillInput.trim()) {
                          setSkills({ ...skills, technical: [...new Set([...skills.technical, techSkillInput.trim()])] });
                          setTechSkillInput('');
                        }
                      }}
                      className="rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {skills.technical.map((sk) => (
                      <span key={sk} className="inline-flex items-center gap-1 rounded bg-slate-800 border border-slate-700/80 px-2 py-0.5 text-xs font-medium text-slate-300">
                        {sk}
                        <button
                          type="button"
                          onClick={() => setSkills({ ...skills, technical: skills.technical.filter((s) => s !== sk) })}
                          className="text-slate-500 hover:text-white"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Soft Skills */}
                <div className="glass-panel rounded-xl p-4 border border-slate-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Soft Skills / Core Competencies</label>
                  
                  <div className="mt-3 flex gap-2">
                    <input
                      type="text"
                      value={softSkillInput}
                      onChange={(e) => setSoftSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && softSkillInput.trim()) {
                          e.preventDefault();
                          setSkills({ ...skills, soft: [...new Set([...skills.soft, softSkillInput.trim()])] });
                          setSoftSkillInput('');
                        }
                      }}
                      className="flex-1 rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs text-white outline-none"
                      placeholder="e.g. Problem Solving"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (softSkillInput.trim()) {
                          setSkills({ ...skills, soft: [...new Set([...skills.soft, softSkillInput.trim()])] });
                          setSoftSkillInput('');
                        }
                      }}
                      className="rounded-lg bg-indigo-600 px-3 text-xs font-semibold text-white hover:bg-indigo-500"
                    >
                      Add
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {skills.soft.map((sk) => (
                      <span key={sk} className="inline-flex items-center gap-1 rounded bg-slate-800 border border-slate-700/80 px-2 py-0.5 text-xs font-medium text-slate-300">
                        {sk}
                        <button
                          type="button"
                          onClick={() => setSkills({ ...skills, soft: skills.soft.filter((s) => s !== sk) })}
                          className="text-slate-500 hover:text-white"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* AI Skill suggestions */}
              <div className="rounded-xl bg-slate-950 p-4 border border-indigo-500/10 mt-6">
                <h4 className="flex items-center gap-1.5 font-bold text-xs text-indigo-400">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Skill Suggestion Engine
                </h4>
                <p className="mt-1 text-[10px] text-slate-500">Input target job title below to auto-inject relevant industry skills.</p>
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="flex-1 rounded-lg border border-slate-800 bg-slate-900 p-2 text-[10px] text-white outline-none"
                    placeholder="e.g. Full Stack Developer"
                  />
                  <button
                    type="button"
                    onClick={handleSuggestSkills}
                    disabled={aiLoading || !targetRole}
                    className="rounded-lg bg-indigo-600 px-3 text-[10px] font-bold text-white hover:bg-indigo-500 disabled:opacity-50"
                  >
                    Suggest
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* CERTIFICATIONS SECTION */}
          {activeSection === 'certifications' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-white">Certifications</h2>
                <button
                  type="button"
                  onClick={addCert}
                  className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-indigo-400 hover:text-white"
                >
                  <Plus className="h-3 w-3" /> Add Certification
                </button>
              </div>

              {certifications.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-6">No certifications added yet.</p>
              )}

              {certifications.map((cert, index) => (
                <div key={index} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4 relative space-y-4">
                  <button
                    onClick={() => removeCert(index)}
                    className="absolute right-4 top-4 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  <h3 className="text-xs font-bold text-indigo-400">Certification #{index + 1}</h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Certification Name</label>
                      <input
                        type="text"
                        value={cert.name}
                        onChange={(e) => {
                          const updated = [...certifications];
                          updated[index].name = e.target.value;
                          setCertifications(updated);
                        }}
                        className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                        placeholder="AWS Certified Solutions Architect"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Issuer</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => {
                          const updated = [...certifications];
                          updated[index].issuer = e.target.value;
                          setCertifications(updated);
                        }}
                        className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                        placeholder="Amazon Web Services"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Date Achieved</label>
                      <input
                        type="text"
                        value={cert.date}
                        onChange={(e) => {
                          const updated = [...certifications];
                          updated[index].date = e.target.value;
                          setCertifications(updated);
                        }}
                        className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                        placeholder="October 2024"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">Credential Link</label>
                      <input
                        type="text"
                        value={cert.link}
                        onChange={(e) => {
                          const updated = [...certifications];
                          updated[index].link = e.target.value;
                          setCertifications(updated);
                        }}
                        className="mt-1.5 block w-full rounded-lg border border-slate-800 bg-slate-950 p-2.5 text-xs text-white outline-none"
                        placeholder="creds.com/myverify"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Live Resume Preview Panel */}
      <div className={`w-full flex-col bg-slate-950 p-6 md:flex md:w-1/2 overflow-y-auto overflow-x-auto ${mobileView === 'preview' ? 'flex' : 'hidden md:flex'}`}>
        <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live High-Fidelity Preview</span>
          
          <div className="flex gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
            {['modern', 'professional', 'minimalist'].map((temp) => (
              <button
                key={temp}
                onClick={() => handleSelectTemplate(temp)}
                className={`rounded px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all ${
                  selectedTemplate === temp
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {temp}
              </button>
            ))}
          </div>
        </div>

        {/* Paper Container */}
        <div 
          ref={previewRef}
          className="mx-auto w-full max-w-[210mm] min-h-[297mm] bg-white p-[15mm] text-slate-800 shadow-2xl rounded-sm"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {renderTemplateContent()}
        </div>
      </div>
    </div>

      {/* Hidden high-fidelity A4 document for PDF capture */}
      <div 
        ref={captureRef}
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '794px',
          minHeight: '1123px',
          padding: '15mm',
          background: 'white',
          color: '#1e293b',
          fontFamily: 'Georgia, serif',
          boxShadow: 'none',
          boxSizing: 'border-box'
        }}
      >
        {renderTemplateContent()}
      </div>

      {/* Slide Drawer AI Assistant */}
      <AIAssistant
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
      />
    </div>
  );
};

export default ResumeBuilder;
