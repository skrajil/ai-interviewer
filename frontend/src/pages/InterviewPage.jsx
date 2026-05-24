import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, Play, MicOff, Volume2, Loader2 } from 'lucide-react'; 
import useSpeechToText from '../hooks/useSpeechToText';
import useTextToSpeech from '../hooks/useTextToSpeech';
import { useInterview } from '../context/InterviewContext';
import { useAuth } from '../context/AuthContext';

export default function InterviewPage() {
  const {currentUser} = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const { 
    role, 
    resumeText, 
    currentQuestion, 
    setCurrentQuestion, 
    saveInterviewResult, 
    sessionHistory,
    addInteraction,
    difficulty
  } = useInterview();
  
  const [hasStarted, setHasStarted] = useState(() => {
    return sessionStorage.getItem('interviewHasStarted') === 'true';
  });

  useEffect(() => {
    sessionStorage.setItem('interviewHasStarted', hasStarted);
  }, [hasStarted]);

  const [status, setStatus] = useState('Ready to begin');
  const [finalAnswer, setFinalAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  //  NEW STATES FOR PRE-FETCHING
  const [preloadedQuestion, setPreloadedQuestion] = useState("");
  const [isPreparing, setIsPreparing] = useState(true);

  const { speak, isSpeaking } = useTextToSpeech();

  // 1. Setup Webcam Feed
  useEffect(() => {
    if (!role) {
      navigate('/');
      return;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch((err) => console.error("Webcam blocked:", err));
    }
  }, [role, navigate]);

  //  2. SECRETLY PRE-FETCH THE FIRST QUESTION ON PAGE LOAD
  useEffect(() => {
    if (!currentQuestion && role && !preloadedQuestion) {
      const fetchFirstQuestion = async () => {
        try {
          const response = await fetch(import.meta.env.VITE_API_URL + '/api/interview/next', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              role,
              resumeText, 
              currentQuestion: "", 
              userAnswer: "", 
              questionCount: 0 
            })
          });
          
          const data = await response.json();
          
          if (data.nextQuestion) {
            setPreloadedQuestion(data.nextQuestion); // Save it secretly
          }else{
            setPreloadedQuestion("Hello! Let's get started. Could you please introduce yourself and your background?");
          }
        } catch (error) {
          console.error("Failed to fetch first question:", error);
          setStatus('Connection Error.Using fallback...');
          setPreloadedQuestion("Hello! Let's get started. Could you please introduce yourself and your background?");
        }finally{
          setIsPreparing(false); // Enable the Start button!
        }
      };

      fetchFirstQuestion();
    }
  }, [role, resumeText, currentQuestion, preloadedQuestion]);

  // 3. Handle user answering mid-interview
  const handleSilence = async (text) => {
    setStatus('AI is thinking...');
    setFinalAnswer(text);
    addInteraction(currentQuestion, text);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/interview/next', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          role, 
          resumeText, 
          currentQuestion, 
          userAnswer: text, 
          questionCount: 1,
          difficulty
        })
      });
      
      const data = await response.json();
      
      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setStatus('Interviewer is speaking...');
        speak(data.nextQuestion);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setStatus('Connection Error');
    }
  };

  const { isListening, transcript, startListening, stopListening } = useSpeechToText(handleSilence);

  // 4. End the interview
  const handleEndInterview = async () => {
    try {
      setIsSaving(true);
      setStatus('AI is analyzing your performance...');
      
      const response = await fetch(import.meta.env.VITE_API_URL + '/api/evaluate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await currentUser.getIdToken()}`
         },
        body: JSON.stringify({ 
          role: role, 
          transcript: sessionHistory 
        })
      });

      if (!response.ok) throw new Error("Backend evaluation failed");
      
      const realGeminiData = await response.json();
      
      setStatus('Saving results to database...');
      await saveInterviewResult(realGeminiData.score, realGeminiData.summary);
      
      navigate('/feedback', { state: { evaluation: realGeminiData } });
    } catch (error) {
      console.error("Failed to save interview:", error);
      setStatus('Error saving results');
      setIsSaving(false);
    }
  };

  if (!role) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 font-sans overflow-hidden text-white relative">
      
      {/*  THE UPGRADED POPUP OVERLAY */}
      {!hasStarted && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-6">
          <div className="bg-[#111] border border-white/10 p-10 rounded-4xl max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-blue-500/10 blur-[80px] pointer-events-none" />
            
            <div className="w-20 h-20 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-6 relative z-10">
              <Mic className="text-blue-400" size={32} />
            </div>
            
            <h2 className="text-2xl font-bold mb-3 relative z-10">Ready to begin?</h2>
            <p className="text-white/50 mb-8 relative z-10">
              Find a quiet place, check your microphone, and take a deep breath. 
            </p>
            
            <button 
              disabled={isPreparing}
              onClick={() => {
                // Instantly load and speak the pre-fetched question! No delay!
                setCurrentQuestion(preloadedQuestion);
                setStatus('Interviewer is speaking...');
                speak(preloadedQuestion);
                setHasStarted(true);
              }}
              className={`w-full flex items-center justify-center gap-2 py-4 rounded-full font-bold text-lg transition-all relative z-10 ${
                isPreparing 
                  ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-gray-200 hover:scale-[1.02] shadow-[0_0_20px_rgba(255,255,255,0.2)]'
              }`}
            >
              {isPreparing ? (
                <><Loader2 size={20} className="animate-spin" /> Preparing AI...</>
              ) : (
                <>Start Interview <Play size={20} fill="currentColor" /></>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="absolute top-8 left-8">
        <h1 className="text-xs uppercase tracking-[0.2em] text-gray-500 font-bold">Interview Session</h1>
        <p className="text-xl font-bold text-primary">{role}</p>
      </div>

      {/* Main Interviewer Stage */}
      <div className="flex flex-col items-center justify-center flex-1 w-full max-w-4xl pb-32">
        {/*  UPGRADED: Siri-Style AI Avatar / Orb */}
        <div className="relative mb-16 flex items-center justify-center">
          {/* Outer Ripple 2 (Only pulses when AI speaks) */}
          <div className={`absolute w-64 h-64 rounded-full border border-blue-500/20 transition-all duration-1000 ${
            isSpeaking ? 'scale-150 opacity-0 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]' : 'scale-100 opacity-0'
          }`} />
          
          {/* Outer Ripple 1 */}
          <div className={`absolute w-56 h-56 rounded-full bg-blue-500/5 transition-all duration-700 ${
            isSpeaking ? 'scale-125 animate-pulse' : 'scale-100'
          }`} />

          {/* The Core Orb */}
          <div className={`relative z-10 w-40 h-40 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
            isSpeaking 
              ? 'bg-linear-to-tr from-blue-600 to-purple-500 shadow-[0_0_80px_rgba(59,130,246,0.6)] scale-110' 
              : isListening 
                ? 'bg-linear-to-tr from-red-500 to-orange-500 shadow-[0_0_60px_rgba(239,68,68,0.4)] scale-105 animate-pulse'
                : 'bg-[#1a1a1a] border border-white/10 shadow-black'
          }`}>
             {isListening ? (
               <Mic className="text-white animate-bounce" size={40} />
             ) : (
               <Volume2 className={`text-white transition-opacity duration-500 ${isSpeaking ? 'opacity-100' : 'opacity-30'}`} size={40} />
             )}
          </div>
        </div>

        {/* Current Question Display */}
        <div className="text-center max-w-2xl px-6 max-h-[35vh] overflow-y-auto no-scrollbar">
          <h2 className="text-2xl md:text-3xl font-semibold leading-snug text-white/90 drop-shadow-sm">
            {currentQuestion || "Waiting to start..."}
          </h2>
        </div>
      </div>

      {/* Bottom Control Bar */}
      <div className="fixed bottom-12 flex items-center gap-6 bg-card/60 backdrop-blur-xl px-8 py-4 rounded-full border border-white/10 shadow-2xl">
        <button 
          onClick={isListening ? stopListening : startListening}
          disabled={isSaving || !hasStarted}
          className={`p-5 rounded-full transition-all duration-300 transform active:scale-95 disabled:opacity-50 ${
            isListening ? 'bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20' : 'bg-primary hover:bg-blue-600 shadow-lg shadow-primary/20'
          }`}
        >
          {isListening ? <MicOff size={24} color="white" /> : <Mic size={24} color="white" />}
        </button>
        
        <button 
          onClick={handleEndInterview} 
          disabled={isSaving || !hasStarted}
          className="px-6 py-3 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-full font-bold transition-all text-sm uppercase tracking-widest border border-red-500/30 disabled:opacity-50"
        >
          {isSaving ? "Saving..." : "End Session"}
        </button>

        <div className="h-10 w-px bg-white/10" />

        <div className="flex flex-col min-w-30">
          <span className="text-[10px] uppercase text-white/40 font-bold tracking-widest">System Status</span>
          <span className="text-sm font-semibold text-white/80">{status}</span>
        </div>
      </div>

      {/* Webcam Preview Corner */}
      <div className="absolute bottom-8 right-8 w-64 h-40 bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover opacity-80" />
        <div className="absolute top-3 right-3 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
          <span className="text-[9px] font-bold text-white/70 uppercase">Live</span>
        </div>
      </div>

    </div>
  );
}