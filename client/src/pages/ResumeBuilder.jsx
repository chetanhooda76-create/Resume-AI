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

  const handleSelectTemplate = async (temp) => {
    setSelectedTemplate(temp);
    localStorage.setItem(`resume_template_${id || 'new'}`, temp);
    try {
      await API.put(`/resumes/${id}`, { template: temp });
    } catch (err) {
      console.error('Error saving template selection:', err);
    }
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
          setSelectedTemplate(data.template || 'modern');
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
          <div style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}>
            {/* Header */}
            <div style={{ borderBottom: '2px solid #4f46e5', paddingBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', letterSpacing: '-0.5px', margin: '0', color: '#0f172a' }}>
                  {personalInfo.name || 'Candidate Name'}
                </h1>
                <p style={{ fontSize: '12px', color: '#4f46e5', fontWeight: '600', letterSpacing: '1px', textTransform: 'uppercase', margin: '4px 0 0 0' }}>
                  {targetRole || 'Professional'}
                </p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '9px', color: '#64748b', lineHeight: '1.4' }}>
                {personalInfo.email && <div>{personalInfo.email}</div>}
                {personalInfo.phone && <div>{personalInfo.phone}</div>}
                {personalInfo.website && <div>{personalInfo.website}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  {personalInfo.github && <span style={{ fontWeight: '600', color: '#475569' }}>GH</span>}
                  {personalInfo.linkedin && <span style={{ fontWeight: '600', color: '#4f46e5' }}>LI</span>}
                </div>
              </div>
            </div>

            {/* Summary */}
            {personalInfo.summary && (
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#4f46e5', marginBottom: '6px', margin: '0' }}>Professional Summary</h3>
                <p style={{ fontSize: '10px', color: '#475569', margin: '0', lineHeight: '1.5' }}>{personalInfo.summary}</p>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#4f46e5', marginBottom: '8px', margin: '0' }}>Work Experience</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {experience.map((exp, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b', margin: '0' }}>
                          {exp.position} <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>at</span> {exp.company}
                        </h4>
                        <span style={{ fontSize: '9px', color: '#64748b', fontWeight: '500' }}>
                          {exp.startDate} – {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      <div style={{ fontSize: '8px', color: '#94a3b8', marginTop: '2px' }}>{exp.location}</div>
                      <p style={{ fontSize: '9.5px', color: '#475569', margin: '6px 0 0 0', whiteSpace: 'pre-line', lineHeight: '1.4' }}>{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#4f46e5', marginBottom: '8px', margin: '0' }}>Key Projects</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {projects.map((proj, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <h4 style={{ fontSize: '11px', fontWeight: 'bold', color: '#1e293b', margin: '0' }}>{proj.title}</h4>
                        {proj.link && <span style={{ fontSize: '8px', color: '#94a3b8' }}>{proj.link}</span>}
                      </div>
                      <div style={{ fontSize: '9px', fontWeight: '600', color: '#6366f1', marginTop: '2px' }}>
                        Tech Stack: {proj.technologies.join(', ')}
                      </div>
                      <p style={{ fontSize: '9.5px', color: '#475569', margin: '4px 0 0 0', whiteSpace: 'pre-line', lineHeight: '1.4' }}>{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Two Column Layout for education, skills, certs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
              {/* Left Side: Education */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {education.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#4f46e5', marginBottom: '8px', margin: '0' }}>Education</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {education.map((edu, i) => (
                        <div key={i} style={{ fontSize: '9.5px' }}>
                          <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{edu.degree} in {edu.fieldOfStudy}</div>
                          <div style={{ color: '#475569' }}>{edu.school}</div>
                          <div style={{ fontSize: '8.5px', color: '#94a3b8', marginTop: '2px' }}>{edu.startDate} – {edu.endDate}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {certifications.length > 0 && (
                  <div>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#4f46e5', marginBottom: '8px', margin: '0' }}>Certifications</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {certifications.map((cert, i) => (
                        <div key={i} style={{ fontSize: '9.5px' }}>
                          <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{cert.name}</div>
                          <div style={{ color: '#64748b' }}>{cert.issuer} • {cert.date}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Skills */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(skills.technical.length > 0 || skills.soft.length > 0) && (
                  <div>
                    <h3 style={{ fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', textTransform: 'uppercase', color: '#4f46e5', marginBottom: '8px', margin: '0' }}>Skills</h3>
                    {skills.technical.length > 0 && (
                      <div style={{ marginBottom: '12px' }}>
                        <h4 style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px', margin: '0' }}>Technical Expertise</h4>
                        <p style={{ fontSize: '9.5px', color: '#475569', margin: '0', lineHeight: '1.4' }}>{skills.technical.join(', ')}</p>
                      </div>
                    )}
                    {skills.soft.length > 0 && (
                      <div>
                        <h4 style={{ fontSize: '9.5px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px', margin: '0' }}>Professional Competencies</h4>
                        <p style={{ fontSize: '9.5px', color: '#475569', margin: '0', lineHeight: '1.4' }}>{skills.soft.join(', ')}</p>
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
          <div style={{ color: '#0f172a', fontFamily: 'Georgia, serif', lineHeight: '1.5' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h1 style={{ fontSize: '26px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 6px 0', color: '#0f172a' }}>
                {personalInfo.name || 'Candidate Name'}
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '12px', fontSize: '10px', color: '#475569', fontWeight: '500' }}>
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.website && <span>• {personalInfo.website}</span>}
                {personalInfo.github && <span>• GH: {personalInfo.github}</span>}
                {personalInfo.linkedin && <span>• LI: {personalInfo.linkedin}</span>}
              </div>
            </div>

            {/* Summary */}
            {personalInfo.summary && (
              <div style={{ marginTop: '16px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px', color: '#0f172a' }}>
                  Professional Profile
                </h3>
                <p style={{ fontSize: '10.5px', color: '#334155', margin: '0', textAlign: 'justify' }}>{personalInfo.summary}</p>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '10px', color: '#0f172a' }}>
                  Employment History
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {experience.map((exp, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '11px', color: '#0f172a' }}>
                        <span>{exp.position} – {exp.company}</span>
                        <span style={{ fontWeight: 'normal', fontSize: '10px', color: '#475569' }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                      </div>
                      <div style={{ fontSize: '9px', fontStyle: 'italic', color: '#64748b', marginTop: '2px' }}>{exp.location}</div>
                      <p style={{ fontSize: '10px', color: '#334155', marginTop: '6px', whiteSpace: 'pre-line', margin: '6px 0 0 0' }}>{exp.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '10px', color: '#0f172a' }}>
                  Education
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {education.map((edu, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10.5px', color: '#0f172a' }}>
                      <div>
                        <span style={{ fontWeight: 'bold' }}>{edu.degree} in {edu.fieldOfStudy}</span>
                        <span style={{ color: '#475569' }}> — {edu.school}</span>
                      </div>
                      <span style={{ fontSize: '10px', color: '#64748b' }}>{edu.startDate} – {edu.endDate}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '10px', color: '#0f172a' }}>
                  Selected Projects
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {projects.map((proj, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '10.5px', color: '#0f172a' }}>
                        <span>{proj.title}</span>
                        {proj.link && <span style={{ fontWeight: 'normal', fontSize: '9px', color: '#64748b' }}>{proj.link}</span>}
                      </div>
                      <div style={{ fontSize: '9px', color: '#64748b', fontStyle: 'italic', marginTop: '2px' }}>Technologies: {proj.technologies.join(', ')}</div>
                      <p style={{ fontSize: '10px', color: '#334155', marginTop: '4px', whiteSpace: 'pre-line', margin: '4px 0 0 0' }}>{proj.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {(skills.technical.length > 0 || skills.soft.length > 0) && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px', color: '#0f172a' }}>
                  Skills Inventory
                </h3>
                <div style={{ fontSize: '10.5px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {skills.technical.length > 0 && (
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#0f172a' }}>Technical Skills:</span> <span style={{ color: '#334155' }}>{skills.technical.join(', ')}</span>
                    </div>
                  )}
                  {skills.soft.length > 0 && (
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#0f172a' }}>Soft Skills:</span> <span style={{ color: '#334155' }}>{skills.soft.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Certifications */}
            {certifications.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <h3 style={{ fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #cbd5e1', paddingBottom: '4px', marginBottom: '8px', color: '#0f172a' }}>
                  Certifications
                </h3>
                <ul style={{ paddingLeft: '16px', margin: '0', listStyleType: 'disc', fontSize: '10.5px', color: '#334155' }}>
                  {certifications.map((cert, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>
                      <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{cert.name}</span> — <span style={{ color: '#475569' }}>{cert.issuer} ({cert.date})</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      case 'minimalist':
        return (
          <div style={{ color: '#1e293b', fontFamily: 'Inter, sans-serif', lineHeight: '1.5' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px', marginBottom: '16px' }}>
              <div>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', letterSpacing: '-0.5px', margin: '0', color: '#0f172a' }}>{personalInfo.name || 'Candidate Name'}</h1>
                <span style={{ fontSize: '9.5px', fontWeight: '600', color: '#64748b' }}>{targetRole || 'Professional'}</span>
              </div>
              <div style={{ textAlign: 'right', fontSize: '8.5px', color: '#64748b', lineHeight: '1.4' }}>
                <div>{personalInfo.email}</div>
                <div>{personalInfo.phone}</div>
                <div>{personalInfo.website}</div>
              </div>
            </div>

            {personalInfo.summary && (
              <div style={{ fontSize: '9.5px', color: '#475569', lineHeight: '1.5', marginBottom: '16px' }}>{personalInfo.summary}</div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {experience.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '6px', margin: '0' }}>Experience</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {experience.map((exp, i) => (
                      <div key={i} style={{ fontSize: '9.5px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                          <span style={{ color: '#1e293b' }}>{exp.position} @ {exp.company}</span>
                          <span style={{ fontWeight: 'normal', color: '#94a3b8' }}>{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                        </div>
                        <p style={{ color: '#475569', margin: '4px 0 0 0', whiteSpace: 'pre-line', lineHeight: '1.4' }}>{exp.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {education.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '6px', margin: '0' }}>Education</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {education.map((edu, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9.5px' }}>
                        <span style={{ color: '#1e293b' }}>{edu.degree} in {edu.fieldOfStudy} — {edu.school}</span>
                        <span style={{ color: '#94a3b8' }}>{edu.startDate} – {edu.endDate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {skills.technical.length > 0 && (
                <div>
                  <h3 style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', marginBottom: '4px', margin: '0' }}>Skills</h3>
                  <p style={{ fontSize: '9.5px', color: '#475569', margin: '0', lineHeight: '1.4' }}>{skills.technical.join(', ')}</p>
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
        template: selectedTemplate,
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
          position: 'fixed',
          left: '200vw',
          top: '200vh',
          width: '794px',
          minHeight: '1123px',
          padding: '15mm',
          background: 'white',
          color: '#1e293b',
          fontFamily: 'Georgia, serif',
          boxShadow: 'none',
          boxSizing: 'border-box',
          zIndex: -9999
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
