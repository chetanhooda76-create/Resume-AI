import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import { User, Mail, ShieldAlert, Upload, CheckCircle2, FileText, Image as ImageIcon, Eye } from 'lucide-react';

const Profile = () => {
  const { user, updateUserState } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [pdfUploading, setPdfUploading] = useState(false);

  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      return showMessage('error', 'Passwords do not match');
    }

    setLoading(true);
    try {
      const payload = { name };
      if (password) payload.password = password;

      const res = await API.put('/auth/profile', payload);
      if (res.data.success) {
        updateUserState({ name: res.data.data.name });
        setPassword('');
        setConfirmPassword('');
        showMessage('success', 'Profile updated successfully');
      }
    } catch (error) {
      console.error(error);
      showMessage('error', error.response?.data?.message || 'Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.match('image.*')) {
      return showMessage('error', 'Please select an image file (png, jpg, jpeg, webp)');
    }

    const formData = new FormData();
    formData.append('profileImage', file);

    setImageUploading(true);
    try {
      const res = await API.post('/auth/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        updateUserState({ profileImage: res.data.data.profileImage });
        showMessage('success', 'Profile image uploaded successfully');
      }
    } catch (error) {
      console.error(error);
      showMessage('error', error.response?.data?.message || 'Error uploading profile image');
    } finally {
      setImageUploading(false);
    }
  };

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      return showMessage('error', 'Please select a valid PDF file');
    }

    const formData = new FormData();
    formData.append('resumePdf', file);

    setPdfUploading(true);
    try {
      const res = await API.post('/auth/upload-pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        updateUserState({ resumePdf: res.data.data.resumePdf });
        showMessage('success', 'Resume PDF uploaded successfully');
      }
    } catch (error) {
      console.error(error);
      showMessage('error', error.response?.data?.message || 'Error uploading resume PDF');
    } finally {
      setPdfUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">Profile Settings</h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Manage your personal account settings, profile image, and backup resume PDF files.
        </p>
      </div>

      {message.text && (
        <div
          className={`mb-6 flex items-center gap-2 rounded-lg border p-4 text-sm ${
            message.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-950/20 text-emerald-400'
              : 'border-red-500/30 bg-red-950/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 shrink-0" />
          ) : (
            <ShieldAlert className="h-5 w-5 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
        {/* Left Column: Image & PDF Uploads */}
        <div className="space-y-6 md:col-span-1">
          {/* Avatar Upload */}
          <div className="glass-panel flex flex-col items-center rounded-2xl p-6 text-center shadow-lg">
            <div className="group relative cursor-pointer" onClick={() => imageInputRef.current?.click()}>
              {user?.profileImage ? (
                <img
                  src={user.profileImage}
                  alt={user.name}
                  className="h-32 w-32 rounded-full border-2 border-slate-700 object-cover transition-opacity group-hover:opacity-75"
                />
              ) : (
                <div className="flex h-32 w-32 items-center justify-center rounded-full bg-slate-800 border-2 border-slate-700 text-3xl font-bold text-indigo-400 transition-opacity group-hover:opacity-75">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-slate-950/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Upload className="h-6 w-6 text-white animate-bounce" />
              </div>
            </div>

            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />

            <h3 className="mt-4 font-bold text-white">{user?.name}</h3>
            <p className="text-xs text-slate-400">{user?.email}</p>

            <button
              onClick={() => imageInputRef.current?.click()}
              disabled={imageUploading}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              {imageUploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent"></div>
              ) : (
                <>
                  <ImageIcon className="h-4.5 w-4.5" />
                  Change Picture
                </>
              )}
            </button>
          </div>

          {/* Backup Resume Upload */}
          <div className="glass-panel rounded-2xl p-6 shadow-lg">
            <h4 className="flex items-center gap-2 font-bold text-white text-sm">
              <FileText className="h-4.5 w-4.5 text-indigo-400" />
              Reference Resume PDF
            </h4>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Upload a copy of your existing PDF resume. This can be stored as a reference backup.
            </p>

            {user?.resumePdf && (
              <div className="mt-4 rounded-lg bg-slate-900/40 border border-slate-800 p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="truncate font-medium text-slate-300 max-w-[120px]">
                    {user.resumePdf.split('/').pop() || 'resume.pdf'}
                  </span>
                  <a
                    href={user.resumePdf}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <Eye className="h-3 w-3" />
                    View
                  </a>
                </div>
              </div>
            )}

            <input
              type="file"
              ref={pdfInputRef}
              onChange={handlePdfUpload}
              accept="application/pdf"
              className="hidden"
            />

            <button
              onClick={() => pdfInputRef.current?.click()}
              disabled={pdfUploading}
              className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50"
            >
              {pdfUploading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload PDF Resume
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Profile details form */}
        <div className="glass-panel rounded-2xl p-6 shadow-lg md:col-span-2">
          <h3 className="font-bold text-white text-lg">Update Profile Settings</h3>
          <p className="text-xs text-slate-400 mt-1">Modify your name or change your account password.</p>

          <form className="mt-6 space-y-5" onSubmit={handleUpdateProfile}>
            {/* Email (Disabled) */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Email Address (Unchangeable)
              </label>
              <div className="relative mt-1.5 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4.5 w-4.5 text-slate-600" />
                </div>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900/20 py-2.5 pl-10 pr-3 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Full Name
              </label>
              <div className="relative mt-1.5 rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4.5 w-4.5 text-slate-500" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-900"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="border-t border-slate-800/80 my-6 pt-5">
              <h4 className="font-bold text-white text-sm">Security / Password Change</h4>
              <p className="text-xs text-slate-400 mt-1">Leave empty if you don't wish to change your password.</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="pass" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                New Password
              </label>
              <input
                id="pass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2.5 px-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-900 mt-1.5"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPass" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                Confirm New Password
              </label>
              <input
                id="confirmPass"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2.5 px-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-900 mt-1.5"
                placeholder="••••••••"
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
