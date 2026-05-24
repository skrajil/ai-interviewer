import React from 'react';
import { useNavigate , useLocation} from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInterview } from '../context/InterviewContext';
import { Trophy, Target, Zap, ChevronRight, LogOut, Home, Rocket, RefreshCcw, BookOpen} from 'lucide-react';

export default function FeedbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, logout } = useAuth();

  const { role: contextRole } = useInterview();
  const routerState = location.state || {};
  const evaluation = routerState.evaluation || {};
  const historicalRole = routerState.role || evaluation.role;

  const score = evaluation.score || 0;
  const role = contextRole || historicalRole || "Candidate";
  const summary = evaluation.summary || "No summary available. Please complete an interview.";

  const strengths = Array.isArray(evaluation.strengths)
  ?evaluation.strengths : ["Complete an interview to see strengths"];

  const weaknesses = Array.isArray(evaluation.weaknesses)
  ?evaluation.weaknesses : ["Complete an interview to see areas for improvement"];

  // Calculate the circle stroke for the massive score ring
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-12 font-sans text-white relative overflow-hidden">
      
      {/* Background Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-12 relative z-10">
        <div>
          <h1 className="text-sm uppercase tracking-[0.2em] text-white/50 font-bold mb-1">Analysis Complete</h1>
          <p className="text-2xl font-bold text-white">{role} Interview</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/setup')} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full transition-all text-sm font-semibold">
            <Home size={16} /> New Interview
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-full transition-all text-sm font-semibold">
            <LogOut size={16} /> Sign Out
          </button>
          <button 
            onClick={() => navigate('/history')}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 rounded-full transition-all text-sm font-semibold">
            View History
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: The Score Ring */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="relative flex items-center justify-center mb-6">
            {/* SVG Circular Progress */}
            <svg className="w-64 h-64 transform -rotate-90">
              <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
              <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="12" fill="transparent" 
                className={`${score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500'} transition-all duration-1000 ease-out`}
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" 
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-6xl font-black tracking-tighter">{score}</span>
              <span className="text-white/40 font-bold tracking-widest uppercase text-xs mt-1">Out of 100</span>
            </div>
          </div>

          <div className={`px-6 py-2 rounded-full font-bold text-sm tracking-widest uppercase border ${
            score >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
            score >= 60 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
            'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {score >= 80 ? 'Strong Hire' : score >= 60 ? 'Potential Hire' : 'Needs Practice'}
          </div>
        </div>

        {/* Right Column: The Breakdown */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Executive Summary */}
          <div className="bg-card/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
            <h3 className="flex items-center gap-3 text-lg font-bold text-white mb-4">
              <Target className="text-primary" /> Executive Summary
            </h3>
            <p className="text-white/70 leading-relaxed text-lg">
              {summary}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths Card */}
            <div className="bg-green-500/5 backdrop-blur-xl border border-green-500/20 rounded-3xl p-8 shadow-xl">
              <h3 className="flex items-center gap-3 text-lg font-bold text-green-400 mb-6">
                <Trophy size={24} /> Key Strengths
              </h3>
              <ul className="space-y-4">
                {strengths.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/80">
                    <Zap className="text-green-500 shrink-0 mt-0.5" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Areas for Improvement Card */}
            <div className="bg-red-500/5 backdrop-blur-xl border border-red-500/20 rounded-3xl p-8 shadow-xl">
              <h3 className="flex items-center gap-3 text-lg font-bold text-red-400 mb-6">
                <Target size={24} /> Areas to Improve
              </h3>
              <ul className="space-y-4">
                {weaknesses.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-white/80">
                    <ChevronRight className="text-red-500 shrink-0 mt-0.5" size={18} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* NEW: Action Plan / Retention CTA */}
          <div className="mt-4 bg-linear-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            
            {/* Background Glow inside the card */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <h3 className="flex items-center gap-3 text-xl font-bold text-white mb-2 relative z-10">
              <Rocket className="text-blue-400" /> Your Next Step
            </h3>
            
            {/* Dynamic message based on their score */}
            <p className="text-white/70 mb-6 relative z-10 max-w-2xl text-lg">
              {score >= 80
                ? "You crushed it! You have a highly competitive profile. Want to challenge yourself with a more senior role?"
                : "You have a solid foundation, but a little more practice will make you unstoppable. Let's run it back and focus on your weak areas."}
            </p>

            <div className="flex flex-wrap gap-4 relative z-10">
              {/* Primary Call to Action */}
              <button
                onClick={() => navigate('/setup')}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)]"
              >
                <RefreshCcw size={18} /> {score >= 80 ? "Try a Harder Interview" : "Retake Interview"}
              </button>

              {/* Teaser Feature */}
              <button
                onClick={() => alert("Coming Soon! We will use your AI transcript to generate a personalized PDF study guide.")}
                className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-bold transition-all"
              >
                <BookOpen size={18} /> Generate Study Guide
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}