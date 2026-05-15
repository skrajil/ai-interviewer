import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import { 
  Briefcase, Code, Database, Layout, Search, 
  Play, History, LogOut, Bot, User, FileText, X, Mail, Lock, Loader2,
  BarChart // 🚨 Added this icon for the difficulty section
} from 'lucide-react';

export default function SetupPage() {
  const navigate = useNavigate();
  
  const { currentUser, logout, loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  
  // 🚨 Grab setDifficulty from Context
  const { setRole, setResumeText, setDifficulty } = useInterview(); 
  
  const [selectedRole, setSelectedRole] = useState('');
  const [customRole, setCustomRole] = useState('');
  const [resumeInput, setResumeInput] = useState(''); 
  
  // 🚨 Local state for Difficulty
  const [localDifficulty, setLocalDifficulty] = useState('Mid-Level');

  // Modal Auth State
  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const presetRoles = [
    { id: 'Frontend Developer', icon: Layout, label: 'Frontend Engineer' },
    { id: 'Backend Developer', icon: Database, label: 'Backend Engineer' },
    { id: 'Full Stack Developer', icon: Code, label: 'Full Stack Engineer' },
    { id: 'Product Manager', icon: Briefcase, label: 'Product Manager' },
  ];

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isLogin) {
        await loginWithEmail(email, password);
      } else {
        await signupWithEmail(email, password); 
      }
      setShowAuth(false);
    } catch (err) {
      setError("Failed to authenticate.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      setShowAuth(false);
    } catch (err) {
      setError("Google sign-in failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (!currentUser) {
      setShowAuth(true);
      return;
    }

    const finalRole = customRole || selectedRole;
    if (!finalRole) return alert("Please select or type a role!");

    // 🚨 Save all three settings to Context before navigating
    setRole(finalRole); 
    setResumeText(resumeInput); 
    setDifficulty(localDifficulty);
    navigate('/interview'); 
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background font-sans text-white relative overflow-hidden flex flex-col">
      
      {/* THE AUTH MODAL OVERLAY */}
      {showAuth && !currentUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="bg-[#111] border border-white/10 p-8 rounded-4xl max-w-md w-full relative shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
            <button onClick={() => setShowAuth(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
              <X size={24} />
            </button>
            <div className="text-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/30">
                <Bot className="text-white" size={24} />
              </div>
              <h2 className="text-2xl font-bold">Sign In Required</h2>
              <p className="text-white/50 text-sm mt-2">Create a free account to save your AI interview results.</p>
            </div>

            {error && <div className="p-3 mb-6 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">{error}</div>}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute top-3.5 left-4 text-white/40" size={18} />
                <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500" />
              </div>
              <div className="relative">
                <Lock className="absolute top-3.5 left-4 text-white/40" size={18} />
                <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white outline-none focus:border-blue-500" />
              </div>
              <button type="submit" disabled={loading} className="w-full py-3.5 mt-2 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? 'Sign In' : 'Create Account')}
              </button>
            </form>

            <div className="flex items-center gap-4 my-4">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs text-white/40 font-semibold uppercase tracking-wider">Or</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            <button type="button" onClick={handleGoogleSignIn} disabled={loading} className="w-full py-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-bold transition-all flex justify-center items-center gap-3">
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              Continue with Google
            </button>

            <div className="mt-6 text-center text-sm text-white/50">
              <button onClick={() => setIsLogin(!isLogin)} className="text-primary hover:text-white font-bold transition-colors">
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 blur-[150px] rounded-full pointer-events-none" />

      {/* THE CONDITIONAL NAVIGATION BAR */}
      <nav className="relative z-10 w-full px-6 py-6 lg:px-12 flex justify-between items-center border-b border-white/5 bg-black/20 backdrop-blur-md">
        
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bot className="text-white" size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white cursor-pointer" onClick={() => navigate('/')}>AI Interviewer</span>
        </div>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <button 
                onClick={() => navigate('/history')}
                className="flex items-center gap-2 px-4 py-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-all text-sm font-medium border border-transparent hover:border-white/10"
              >
                <History size={16} /> History
              </button>
              
              <div className="w-px h-6 bg-white/10 mx-2" />
              
              <div className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                <User size={14} className="text-white/50" />
                <span className="text-sm text-white/70 max-w-30 truncate">
                  {currentUser.email}
                </span>
              </div>

              <button 
                onClick={handleLogout}
                className="p-2 text-white/50 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button 
              onClick={() => setShowAuth(true)}
              className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer px-4 py-2 bg-white/5 rounded-full border border-white/10"
            >
              Sign In
            </button>
          )}
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 mt-4 mb-12">
        <div className="max-w-3xl w-full space-y-10">
          
          <div className="text-center space-y-4">
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-linear-to-r from-white to-white/60">
              Configure Your Interview
            </h1>
            <p className="text-lg text-white/50 max-w-xl mx-auto leading-relaxed">
              Select your target role and paste your resume. The AI will dynamically generate questions tailored to your actual experience.
            </p>
          </div>

          {/* 🚨 REDESIGNED ROLE SECTION 🚨 */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/40 ml-1">
              1. What role are you interviewing for?
            </h3>
            
            {/* Unified Smart Input */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Search size={20} className={`${selectedRole || customRole ? 'text-blue-400' : 'text-white/40'} transition-colors duration-300`} />
              </div>
              <input 
                type="text" 
                placeholder="e.g. Senior iOS Engineer, Product Designer..." 
                value={customRole || (presetRoles.find(p => p.id === selectedRole)?.label || '')} 
                onChange={(e) => { 
                  setCustomRole(e.target.value); 
                  setSelectedRole(''); // Clear preset if they start typing naturally
                }} 
                className="w-full bg-[#1a1a1a] border border-white/10 hover:border-white/20 focus:border-blue-500/50 rounded-2xl py-5 pl-14 pr-5 text-white text-lg placeholder:text-white/30 outline-none transition-all focus:ring-4 focus:ring-blue-500/10 shadow-inner" 
              />
            </div>

            {/* Quick Preset Tags */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-xs font-bold text-white/30 uppercase tracking-wider py-2 pr-2">Popular:</span>
              {presetRoles.map((preset) => {
                const Icon = preset.icon;
                const isActive = selectedRole === preset.id && !customRole;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => { setSelectedRole(preset.id); setCustomRole(''); }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                        : 'bg-white/5 text-white/60 border border-white/5 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon size={14} />
                    {preset.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 🚨 NEW DIFFICULTY SECTION 🚨 */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/40 ml-1 flex items-center gap-2">
              <BarChart size={16} /> 2. Select Difficulty Level
            </h3>
            <div className="relative">
              <select 
                value={localDifficulty}
                onChange={(e) => setLocalDifficulty(e.target.value)}
                className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl py-4 px-5 text-white appearance-none outline-none transition-all focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
              >
                <option value="Junior">Junior (Focus on basics & fundamentals)</option>
                <option value="Mid-Level">Mid-Level (Scenario-based practical questions)</option>
                <option value="Senior">Senior (Architecture, Scaling & Leadership)</option>
              </select>
              {/* Custom dropdown arrow to match your UI */}
              <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>

          {/* 🚨 UPDATED RESUME SECTION TO STEP 3 🚨 */}
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-bold tracking-widest uppercase text-white/40 ml-1 flex items-center gap-2">
              <FileText size={16} /> 3. Paste Your Resume (preferable)
            </h3>
            <textarea placeholder="Paste the text of your resume or LinkedIn profile here..." value={resumeInput} onChange={(e) => setResumeInput(e.target.value)} rows={5} className="w-full bg-black/40 border border-white/10 focus:border-blue-500/50 rounded-2xl py-4 px-5 text-white placeholder:text-white/30 outline-none transition-all focus:ring-4 focus:ring-blue-500/10 resize-none no-scrollbar" />
          </div>

          <div className="pt-6 flex justify-end">
            <button
              onClick={handleStart}
              disabled={!selectedRole && !customRole}
              className={`flex items-center gap-3 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${
                selectedRole || customRole ? 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]' : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              Start Session <Play size={20} className={selectedRole || customRole ? 'text-black' : 'text-white/30'} fill="currentColor" />
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}