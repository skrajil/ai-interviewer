import React, { createContext, useState, useContext } from 'react';
import { db } from '../firebase'; // Import your Firestore instance
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore'; 
import { useAuth } from './AuthContext'; // To link the interview to the user

const InterviewContext = createContext();

export const useInterview = () => useContext(InterviewContext);

export const InterviewProvider = ({ children }) => {
  const { currentUser } = useAuth(); // Access the logged-in user

  // --- Existing State ---
  const [role, setRole] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [sessionHistory, setSessionHistory] = useState([]); 
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [difficulty, setDifficulty] = useState("Mid-Level");
  // --- Helper to track the conversation ---
  const addInteraction = (question, answer) => {
    setSessionHistory(prev => [...prev, { question, answer }]);
  };

  // --- NEW: Save the Final Results to Firebase ---
  const saveInterviewResult = async (finalScore, feedbackSummary) => {
    if (!currentUser) {
      console.error("No user found! Cannot save to database.");
      return null;
    }

    try {
      // We save EVERYTHING: who they are, what they applied for, and the full transcript
      const docRef = await addDoc(collection(db, 'interviews'), {
        userId: currentUser.uid,
        userEmail: currentUser.email,
        role: role,
        score: finalScore,
        summary: feedbackSummary,
        transcript: sessionHistory, // This saves every Q&A pair from your state
        createdAt: serverTimestamp(),
      });

      console.log("Interview archived successfully! ID:", docRef.id);
      return docRef.id;
    } catch (error) {
      console.error("Firestore Save Error:", error);
      throw error;
    }
  };
  // 🗑️ Delete an interview from Firebase
  const deleteInterview = async (interviewId) => {
    try {
      const isConfirmed = window.confirm("Are you sure you want to delete this interview record? This cannot be undone.");
      if (!isConfirmed) return false;

      // Find the specific document in the 'interviews' collection and delete it
      await deleteDoc(doc(db, 'interviews', interviewId));
      console.log("Interview deleted successfully!");
      return true; // Tells the frontend the deletion worked
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
      saveInterviewResult, deleteInterview // Export this so the Feedback/Interview pages can call it
    }}>
      {children}
    </InterviewContext.Provider>
  );
};