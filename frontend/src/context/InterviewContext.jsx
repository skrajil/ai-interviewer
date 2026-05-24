import React, { createContext, useState, useContext, useEffect } from 'react'; // 🚨 Added useEffect here
import { db } from '../firebase'; 
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'; 
import { useAuth } from './AuthContext'; 

const InterviewContext = createContext();

export const useInterview = () => useContext(InterviewContext);

export const InterviewProvider = ({ children }) => {
  const { currentUser } = useAuth(); 

  // --- 1. UPGRADED STATE: Read from sessionStorage on load ---
  const [role, setRole] = useState(() => {
    return sessionStorage.getItem('interviewRole') || '';
  });

  const [resumeText, setResumeText] = useState(() => {
    return sessionStorage.getItem('interviewResumeText') || '';
  });

  const [currentQuestion, setCurrentQuestion] = useState(() => {
    return sessionStorage.getItem('interviewCurrentQuestion') || '';
  });

  const [difficulty, setDifficulty] = useState(() => {
    return sessionStorage.getItem('interviewDifficulty') || 'Mid-Level';
  });

  const [sessionHistory, setSessionHistory] = useState(() => {
    const savedHistory = sessionStorage.getItem('interviewHistory');
    return savedHistory ? JSON.parse(savedHistory) : [];
  });

  // --- 2. AUTOSAVE: Write to sessionStorage whenever state changes ---
  useEffect(() => {
    sessionStorage.setItem('interviewRole', role);
  }, [role]);

  useEffect(() => {
    sessionStorage.setItem('interviewResumeText', resumeText);
  }, [resumeText]);

  useEffect(() => {
    sessionStorage.setItem('interviewCurrentQuestion', currentQuestion);
  }, [currentQuestion]);

  useEffect(() => {
    sessionStorage.setItem('interviewDifficulty', difficulty);
  }, [difficulty]);

  useEffect(() => {
    sessionStorage.setItem('interviewHistory', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  // --- Helper to track the conversation ---
  const addInteraction = (question, answer) => {
    setSessionHistory(prev => [...prev, { question, answer }]);
  };

  // --- Save Final Results to Firebase ---
  const saveInterviewResult = async (finalScore, feedbackSummary) => {
    if (!currentUser) {
      console.error("No user found! Cannot save to database.");
      return null;
    }

    try {
      const docRef = await addDoc(collection(db, 'interviews'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        role: role,
        score: finalScore,
        summary: feedbackSummary,
        transcript: sessionHistory, 
        createdAt: serverTimestamp(),
      });

      console.log("Interview archived successfully! ID:", docRef.id);
      
      //  NEW: Wipe the temporary memory clean so the next interview starts fresh!
      sessionStorage.clear();

      return docRef.id;
    } catch (error) {
      console.error("Firestore Save Error:", error);
      throw error;
    }
  };

  // --- Delete an interview from Firebase ---
  const deleteInterview = async (interviewId) => {
    try {
      const isConfirmed = window.confirm("Are you sure you want to delete this interview record? This cannot be undone.");
      if (!isConfirmed) return false;

      await deleteDoc(doc(db, 'interviews', interviewId));
      console.log("Interview deleted successfully!");
      return true; 
    } catch (error) {
      console.error("Error deleting interview:", error);
      return false;
    }
  };

  return (
    <InterviewContext.Provider value={{
      role, setRole,
      resumeText, setResumeText,
      sessionHistory, addInteraction,
      currentQuestion, setCurrentQuestion,
      difficulty, setDifficulty,
      saveInterviewResult, deleteInterview 
    }}>
      {children}
    </InterviewContext.Provider>
  );
};