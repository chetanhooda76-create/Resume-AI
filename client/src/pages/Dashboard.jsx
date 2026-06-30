import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { Plus, FileText, Trash2, Edit, Calendar, User, Sparkles, CheckSquare, Award } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  
  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      const res = await API.get('/resumes');
      if (res.data.success) {
        setResumes(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleCreateResume = async () => {
    try {
      const payload = {
        title: `Resume - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
        personalInfo: {
          name: user?.name || '',
          email: user?.email || '',
          phone: '',
          website: '',
          github: '',
          linkedin: '',
          summary: '',
        },
        education: [],
        experience: [],
        projects: [],
        skills: { technical: [], soft: [] },
        certifications: [],
      };

      const res = await API.post('/resumes', payload);
      if (res.data.success) {
        navigate(`/builder/${res.data.data._id}`);
      }
    } catch (error) {
      console.error('Error creating resume:', error);
    }
  };

  const handleDeleteResume = async (id, e) => {
    e.stopPropagation(); // Prevent card click
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    setDeletingId(id);
    try {
      const res = await API.delete(`/resumes/${id}`);
      if (res.data.success) {
        setResumes((prev) => prev.filter((r) => r._id !== id));
      }
    } catch (error) {
      console.error('Error deleting resume:', error);
    } finally {
      setDeletingId(null);
    }
  };

  // Calculate profile completeness checklist
  const hasAvatar = !!user?.profileImage;
  const hasBackupPdf = !!user?.resumePdf;
  const hasResume = resumes.length > 0;
  
  // Scoring completeness (out of 100%)
  let completenessScore = 10; // 10% for registration
  if (hasAvatar) completenessScore += 30;
  if (hasBackupPdf) completenessScore += 20;
  if (hasResume) completenessScore += 40;

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      {/* Welcome Hero */}
      <div className="relative mb-10 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 p-8 border border-indigo-500/10">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sparkles className="h-40 w-40 text-indigo-400" />
        </div>
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Career Builder
          </span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Welcome, {user?.name}!
          </h1>
          <p className="mt-2 text-slate-300 max-w-2xl text-sm leading-relaxed">
            Create, improve, and tailor your resumes using our AI assistant. Ready to stand out from the competition? Get started now.
          </p>
          <button
            onClick={handleCreateResume}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:shadow-indigo-500/20"
          >
            <Plus className="h-4.5 w-4.5" />
            Create New Resume
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Side: Profile Completeness Checklist */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-panel rounded-2xl p-6 shadow-lg">
            <h2 className="flex items-center gap-2 font-bold text-white text-base">
              <Award className="h-5 w-5 text-indigo-400" />
              Profile Completeness
            </h2>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1.5">
                <span>Completion Status</span>
                <span className="text-indigo-400">{completenessScore}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${completenessScore}%` }}
                ></div>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-white ${
                  hasAvatar ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700 bg-slate-900'
                }`}>
                  {hasAvatar && <CheckSquare className="h-4.5 w-4.5" />}
                </div>
                <div>
                  <h4 className={`text-xs font-semibold ${hasAvatar ? 'text-slate-200 line-through' : 'text-slate-400'}`}>
                    Upload Profile Picture
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Let employers put a face to your name.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-white ${
                  hasBackupPdf ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700 bg-slate-900'
                }`}>
                  {hasBackupPdf && <CheckSquare className="h-4.5 w-4.5" />}
                </div>
                <div>
                  <h4 className={`text-xs font-semibold ${hasBackupPdf ? 'text-slate-200 line-through' : 'text-slate-400'}`}>
                    Upload Backup PDF Resume
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Keep an existing copy of your resume ready.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-white ${
                  hasResume ? 'bg-indigo-600 border-indigo-600' : 'border-slate-700 bg-slate-900'
                }`}>
                  {hasResume && <CheckSquare className="h-4.5 w-4.5" />}
                </div>
                <div>
                  <h4 className={`text-xs font-semibold ${hasResume ? 'text-slate-200 line-through' : 'text-slate-400'}`}>
                    Create your first ResumeAI
                  </h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">Build a high-fidelity live online resume.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Resumes List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              Saved Resumes
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              Total Resumes: {resumes.length}
            </span>
          </div>

          {loading ? (
            <div className="glass-panel flex flex-col items-center justify-center rounded-2xl py-20 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              <p className="mt-4 text-sm text-slate-400">Loading your resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="glass-panel flex flex-col items-center justify-center rounded-2xl border-dashed border-slate-700 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-400 mb-4">
                <FileText className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-white">No resumes created yet</h3>
              <p className="mt-2 text-xs text-slate-400 max-w-sm px-6 leading-relaxed">
                Start by creating your first resume. You can customize the sections and use AI to optimize descriptions in minutes!
              </p>
              <button
                onClick={handleCreateResume}
                className="mt-6 flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition-transform hover:-translate-y-0.5"
              >
                <Plus className="h-4 w-4" />
                Build My First Resume
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {resumes.map((resume) => (
                <div
                  key={resume._id}
                  onClick={() => navigate(`/builder/${resume._id}`)}
                  className="glass-panel group relative cursor-pointer overflow-hidden rounded-2xl p-5 shadow-md transition-all hover:border-indigo-500/30 hover:bg-slate-900/60 hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-indigo-400 shadow-inner group-hover:bg-indigo-950/20 group-hover:text-indigo-300">
                      <FileText className="h-5 w-5" />
                    </div>
                    <button
                      onClick={(e) => handleDeleteResume(resume._id, e)}
                      disabled={deletingId === resume._id}
                      className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-red-950/30 hover:text-red-400"
                    >
                      {deletingId === resume._id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent"></div>
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <h3 className="mt-4 font-bold text-white truncate pr-6 group-hover:text-indigo-300 transition-colors">
                    {resume.title}
                  </h3>

                  <div className="mt-6 flex items-center gap-4 text-[10px] font-semibold text-slate-400 border-t border-slate-800/80 pt-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Updated {new Date(resume.updatedAt).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3.5 w-3.5" />
                      {resume.personalInfo?.name || 'No Name'}
                    </span>
                  </div>

                  <div className="absolute right-4 bottom-4 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                      Edit
                      <Edit className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
