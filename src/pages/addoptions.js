import { useState } from 'react';
import axios from 'axios';
import { getToken } from '../services/auth';

const AddAnswerOption = ({ questionId }) => {
  const [option, setOption] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const token = getToken(); // Retrieve the authentication token

  const handleSubmit = async () => {
    try {
      await axios.post(
        'https://apiv1.bin.net.tr:8080/api/answerOptions/addAnswerOption',
        { option, isCorrect, questionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOption('');
      setIsCorrect(false); // Reset the form
    } catch (error) {
      console.error('Error adding answer option', error);
    }
  };

  return (
    <div>
      <input 
        type="text" 
        placeholder="Answer Option" 
        value={option} 
        onChange={(e) => setOption(e.target.value)} 
      />
      <input 
        type="checkbox" 
        checked={isCorrect} 
        onChange={() => setIsCorrect(!isCorrect)} 
      /> Correct
      <button onClick={handleSubmit}>Add Option</button>
    </div>
  );
};

export default AddAnswerOption;
