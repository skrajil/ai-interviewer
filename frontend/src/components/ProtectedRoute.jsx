import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Mail, Lock } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { currentUser, loginWithGoogle, loginWithEmail, signupWithEmail } = useAuth();
  
  // NEW: Added state for the email/password form
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // If they ARE logged in, let them see the page!
  if (currentUser) {
    return children;
  }

  // NEW: Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignUp) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    }
  };

  const handleGoogle = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError('Google login failed.');
    }
  };

  // If the user is NOT logged in, show the upgraded Bouncer screen
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
       {/* Background Glow */}
       <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
       
       <div className="bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl max-w-md w-full text-center z-10 shadow-2xl">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary/30">
             <ShieldAlert className="text-primary" size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {isSignUp ? 'Create an Account' : 'Authentication Required'}
          </h2>
          <p className="text-white/60 mb-6 text-sm">
            Please sign in to access this page and view your interview history.
          </p>

          {/* Error Message Display */}
          {error && <div className="p-3 mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl">{error}</div>}

          {/* NEW: Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            <div className="relative text-left">
              <Mail className="absolute left-3 top-3.5 text-white/40" size={18} />
              <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="relative text-left">
              <Lock className="absolute left-3 top-3.5 text-white/40" size={18} />
              <input type="password" required placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 p-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <button type="submit" className="w-full py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)]">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px bg-white/10 flex-1" />
            <span className="text-white/40 text-xs uppercase tracking-widest font-bold">Or</span>
            <div className="h-px bg-white/10 flex-1" />
          </div>

          {/* Google Button */}
          <button 
            onClick={handleGoogle}
            className="w-full py-3 bg-white text-black hover:bg-gray-200 rounded-xl font-bold transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Toggle between Sign Up and Sign In */}
          <p className="text-center mt-6 text-sm text-white/50">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            <button onClick={() => setIsSignUp(!isSignUp)} className="text-primary hover:text-blue-400 font-bold ml-2">
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

       </div>
    </div>
  );
}