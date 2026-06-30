import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LayoutDashboard, FileText, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="glass-panel sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/80 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Brand */}
        <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            ResumeAI
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-white ${
              isActive('/dashboard') ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>

          <Link
            to="/profile"
            className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-white ${
              isActive('/profile') ? 'text-indigo-400' : 'text-slate-400'
            }`}
          >
            <UserIcon className="h-4 w-4" />
            Profile Settings
          </Link>
        </div>

        {/* Right side: User Profile Info & Logout */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 border-r border-slate-800 pr-4">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/30"
              />
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-indigo-400">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <span className="hidden text-sm font-semibold text-slate-300 md:block">{user.name}</span>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-red-500/30 hover:bg-red-950/20 hover:text-red-400"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
