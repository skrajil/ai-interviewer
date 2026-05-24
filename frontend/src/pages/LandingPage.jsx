import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, Mic, Zap, BarChart3, Code, Briefcase, 
  MessageSquare, ArrowRight, X, Mail, Lock, Loader2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

export default function LandingPage() {

  //  Silently wake up the backend while the user reads the page
  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + '/api/wakeup')
      .then(res => console.log("Backend is awake!"))
      .catch(err => console.error("Wakeup ping failed", err));
  }, []);

  const navigate = useNavigate();
  const { loginWithGoogle,
    signupWithEmail,
    loginWithEmail, currentUser } = useAuth(); 

  const [showAuth, setShowAuth] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      setShowAuth(false); // Just close the modal on success
    } catch (err) {
      setError("Failed to authenticate. Please check your credentials.");
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
      setShowAuth(false); // Just close the modal on success
    } catch (err) {
      setError("Google sign-in failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-white font-sans overflow-x-hidden">
      
      {/* THE AUTH MODAL */}
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
              <h2 className="text-2xl font-bold">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
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

      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full -z-10 pointer-events-none" />

      {/* NAVIGATION BAR */}
      <nav className="w-full max-w-6xl mx-auto flex items-center justify-between py-6 px-6 z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Bot className="text-white" size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">AI Interviewer</span>
        </div>
        
        {currentUser ? (
          <button onClick={() => navigate('/setup')} className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer">
            Home
          </button>
        ) : (
          <button onClick={() => setShowAuth(true)} className="text-sm font-semibold hover:text-primary transition-colors cursor-pointer">
            Sign In
          </button>
        )}
      </nav>

      {/* HERO SECTION */}
      <main className="w-full max-w-6xl mx-auto flex flex-col items-center text-center pt-15 pb-32 px-6 z-10 relative">
        <div className="px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-8 inline-flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-semibold tracking-widest text-white/70 uppercase">Powered by Gemini 3.1 Flash-Lite</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black mb-6 tracking-tighter leading-tight drop-shadow-2xl">
          Master the Interview. <br />
          <span className="text-transparent bg-clip-text bg-linear-to-r from-primary to-blue-300">
            Land the Job.
          </span>
        </h1>
        
        <p className="text-xl text-white/60 max-w-2xl mb-12 font-light leading-relaxed">
          Experience hyper-realistic, 1-on-1 voice interviews with an advanced AI recruiter. 
          Get instant feedback, analyze your stress levels, and perfect your pitch.
        </p>
        
        {/*  This now ALWAYS goes to setup page! */}
        <button 
          onClick={() => navigate('/setup')}
          className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-primary text-white rounded-full text-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.6)]"
        >
          Start Your Mock Interview
          <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </button>
      </main>

      {/* FEATURES GRID & AUTHOR SECTION STAY EXACTLY THE SAME... */}
      <section className="w-full bg-card/30 border-y border-white/5 py-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-card border border-white/5 p-8 rounded-3xl">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><Mic className="text-primary" size={28} /></div>
            <h3 className="text-xl font-bold mb-3">Real-Time Voice</h3>
            <p className="text-white/50 leading-relaxed">No typing required. Speak naturally to the AI just like you would on a Zoom call with a real hiring manager.</p>
          </div>
          <div className="bg-card border border-white/5 p-8 rounded-3xl">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><Zap className="text-primary" size={28} /></div>
            <h3 className="text-xl font-bold mb-3">Adaptive Intelligence</h3>
            <p className="text-white/50 leading-relaxed">The AI dynamically changes its questions based on your resume skills and how well you answer previous questions.</p>
          </div>
          <div className="bg-card border border-white/5 p-8 rounded-3xl">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6"><BarChart3 className="text-primary" size={28} /></div>
            <h3 className="text-xl font-bold mb-3">Deep Analytics</h3>
            <p className="text-white/50 leading-relaxed">Get a comprehensive breakdown of your performance, including score rings, core strengths, and areas to improve.</p>
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section className="w-full max-w-4xl mx-auto py-32 px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-primary mb-2">The Architect</h2>
          <h3 className="text-4xl font-bold">Built by  sK rAjIl iSlAm</h3>
        </div>

        <div className="bg-card/80 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
          
          {/* Subtle background glow for the card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] rounded-full pointer-events-none" />

          {/* Image Container - Replace src with your photo */}
          <div className="w-48 h-48 md:w-64 md:h-64 shrink-0 rounded-full border-4 border-primary/30 p-2 relative z-10">
            <img 
              src="/myPhoto.jpeg" 
              alt="Author Portrait" 
              className="w-full h-full object-cover rounded-full filter grayscale hover:grayscale-0 transition-all duration-500"
            />
          </div>

          <div className="text-center md:text-left relative z-10">
            <div className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-bold text-white/70 mb-4">
              Full Stack Developer
            </div>
            <p className="text-lg text-white/70 leading-relaxed mb-8">
              I built this AI Mock Interviewer to bridge the gap between learning to code and actually landing the job. Passionate about React, AI integrations, and building beautiful user experiences.
            </p>
            
            <div className="flex items-center justify-center md:justify-start gap-4">
                <a href="https://github.com/skrajil" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="p-3 bg-white/5 hover:bg-primary hover:text-white rounded-xl transition-all duration-300 border border-white/10 group">
                    <Code size={20} className="text-white/70 group-hover:text-white" />
                </a>
                <a href="https://www.linkedin.com/in/sk-rajil-islam-b9b96b284/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-3 bg-white/5 hover:bg-[#0077b5] hover:border-[#0077b5] rounded-xl transition-all duration-300 border border-white/10 group">
                    <Briefcase size={20} className="text-white/70 group-hover:text-white" />
                </a>
                <a href="#" className="p-3 bg-white/5 hover:bg-[#1DA1F2] hover:border-[#1DA1F2] rounded-xl transition-all duration-300 border border-white/10 group">
                    <MessageSquare size={20} className="text-white/70 group-hover:text-white" />
                </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="w-full border-t border-white/5 py-8 text-center text-white/30 text-sm">
        <p>© 2026 AI Interviewer. Built with React & Gemini API.</p>
      </footer>
    </div>
  );
}