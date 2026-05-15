import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 🚨 Added useInterview
import { useInterview } from '../context/InterviewContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
// 🚨 Added Trash2 icon
import { Clock, Trophy, ArrowRight, Home, Bot, Trash2 } from 'lucide-react';

export default function HistoryPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  // 🚨 Grab the new delete function from context
  const { deleteInterview } = useInterview(); 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!currentUser) return;
      
      try {
        const q = query(
          collection(db, 'interviews'), 
          where('userId', '==', currentUser.uid) 
        );
        
        const querySnapshot = await getDocs(q);
        const historyData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // 🚨 Sort so the newest interviews show up at the top!
        historyData.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
        
        setInterviews(historyData);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [currentUser]);

  // 🚨 The Optimistic Delete Handler
  const handleDelete = async (e, id) => {
    e.stopPropagation(); // 🚨 Stops the click from triggering the card's navigate()!
    
    const success = await deleteInterview(id);
    if (success) {
      // Instantly remove from UI without refreshing
      setInterviews(prev => prev.filter(interview => interview.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 lg:p-12 font-sans text-white relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Nav */}
      <div className="flex justify-between items-center mb-12 relative z-10">
        <div>
          <div className="flex items-center gap-3 pb-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Bot className="text-white" size={22} />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">AI Interviewer</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Interview History</h1>
          <p className="text-white/60 mt-1">Review your past performances</p>
        </div>
        <button onClick={() => navigate('/setup')} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full transition-all text-sm font-semibold">
          <Home size={16} /> New Interview
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto">
        {loading ? (
          <div className="text-center text-white/50 py-20">Loading your history...</div>
        ) : interviews.length === 0 ? (
          <div className="text-center bg-card/40 border border-white/10 rounded-3xl p-12">
            <Clock className="mx-auto text-white/20 mb-4" size={48} />
            <h3 className="text-xl font-bold mb-2">No interviews yet</h3>
            <p className="text-white/60 mb-6">Complete your first mock interview to see your history here.</p>
            <button onClick={() => navigate('/setup')} className="px-6 py-3 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold transition-all">
              Start an Interview
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interviews.map((interview) => (
              <div 
                key={interview.id} 
                onClick={() => navigate('/feedback', { 
                  state: { evaluation: interview, role: interview.role } 
                })}
                className="bg-card/40 hover:bg-card/60 backdrop-blur-xl border border-white/10 hover:border-primary/50 cursor-pointer rounded-2xl p-6 transition-all group relative"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-primary transition-colors">
                      {interview.role || "Candidate"} Interview
                    </h3>
                    <p className="text-sm text-white/40 mt-1">
                      {interview.createdAt ? new Date(interview.createdAt.toDate()).toLocaleDateString() : 'Past Interview'}
                    </p>
                  </div>
                  <div className={`flex items-center justify-center w-12 h-12 rounded-full border ${
                    interview.score >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                    interview.score >= 60 ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    <span className="font-bold">{interview.score || 0}</span>
                  </div>
                </div>
                
                <p className="text-sm text-white/60 line-clamp-2 mb-4">
                  {interview.summary}
                </p>
                
                {/* 🚨 Bottom Row: View Feedback + Trash Can */}
                <div className="flex items-center justify-between mt-auto pt-2">
                  <div className="flex items-center text-primary text-sm font-bold gap-2">
                    View Full Feedback <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                  
                  {/* 🚨 The Delete Button */}
                  <button 
                    onClick={(e) => handleDelete(e, interview.id)}
                    className="p-2 bg-red-500/10 text-red-400 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white"
                    title="Delete Record"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}