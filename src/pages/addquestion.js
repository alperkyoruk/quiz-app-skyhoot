import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '../services/auth';

const AddQuestion = ({ setQuestions }) => {
  const [question, setQuestion] = useState('');
  const [timeLimit, setTimeLimit] = useState(30);
  const [score, setScore] = useState(100);
  const token = getToken(); // Retrieve the authentication token

  const isAuthenticated = useAuth();
  if (!isAuthenticated) return <div>Redirecting...</div>;

  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        'https://api.skyhoot.yildizskylab.com/api/questions/addQuestion',
        { question, timeLimit, score },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setQuestion('');
      setTimeLimit(30);
      setScore(100);
    } catch (error) {
      console.error('Error adding question', error);
    }
  };

  return (
    <div>
      <h2>Create Question</h2>
      <input 
        type="text" 
        placeholder="Question" 
        value={question} 
        onChange={(e) => setQuestion(e.target.value)} 
      />
      <input 
        type="number" 
        placeholder="Time Limit" 
        value={timeLimit} 
        onChange={(e) => setTimeLimit(e.target.value)} 
      />
      <input 
        type="number" 
        placeholder="Score" 
        value={score} 
        onChange={(e) => setScore(e.target.value)} 
      />
      <button onClick={handleSubmit}>Add Question</button>
    </div>
  );
};

export default AddQuestion;
