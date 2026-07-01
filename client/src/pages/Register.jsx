import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Sparkles, User, ArrowRight } from 'lucide-react';
import logoBranding from '../assets/logo_branding.png';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(name, email, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12 bg-slate-950 text-white select-none">
      {/* Form Section */}
      <div className="lg:col-span-7 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Decorative background grid and glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-1/4 left-1/4 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 h-80 w-80 rounded-full bg-purple-500/10 blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 w-full max-w-md space-y-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Get Started
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              Create an account to build standout resumes using AI
            </p>
          </div>

          <div className="glass-panel rounded-2xl p-8 shadow-xl bg-slate-900/40 backdrop-blur-md border border-slate-800/80">
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-950/20 p-3 text-sm text-red-400">
                  {error}
                </div>
              )}

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
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-900"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <div className="relative mt-1.5 rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="h-4.5 w-4.5 text-slate-500" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-900"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <div className="relative mt-1.5 rounded-lg shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lock className="h-4.5 w-4.5 text-slate-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:bg-slate-900"
                    placeholder="Min. 6 characters"
                    minLength={6}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 py-3 px-4 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                ) : (
                  <span className="flex items-center gap-1.5">
                    Sign Up
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-sm text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-indigo-400 transition-colors hover:text-indigo-300">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Branding Mockup Showcase Section */}
      <div className="hidden lg:flex lg:col-span-5 relative items-center justify-center overflow-hidden border-l border-slate-800/80 bg-slate-950">
        <div className="absolute inset-0 z-0">
          <img 
            src={logoBranding} 
            alt="Resume AI Branding Mockup" 
            className="h-full w-full object-cover opacity-35 mix-blend-luminosity scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/60 to-transparent"></div>
          {/* Subtle colored ambient glows */}
          <div className="absolute top-1/3 left-1/3 h-96 w-96 rounded-full bg-indigo-500/20 blur-[120px] pointer-events-none"></div>
          <div className="absolute bottom-1/3 right-1/3 h-96 w-96 rounded-full bg-purple-500/20 blur-[120px] pointer-events-none"></div>
        </div>

        <div className="relative z-10 max-w-md p-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium tracking-wide">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Builder
          </div>
          <div className="space-y-3">
            <h3 className="text-3xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Join Resume AI
            </h3>
            <p className="text-sm leading-relaxed text-slate-400">
              Create your account in seconds and instantly unlock professional resume features, automated writing assistant tools, and high-fidelity templates.
            </p>
          </div>
          
          <div className="pt-4 flex justify-center gap-6 text-xs text-slate-500 border-t border-slate-800/80">
            <div>
              <span className="block text-white font-semibold">100%</span> Custom Templates
            </div>
            <div className="border-l border-slate-800 h-8"></div>
            <div>
              <span className="block text-white font-semibold">Instant</span> PDF Downloads
            </div>
            <div className="border-l border-slate-800 h-8"></div>
            <div>
              <span className="block text-white font-semibold">Smart</span> AI Suggestions
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

