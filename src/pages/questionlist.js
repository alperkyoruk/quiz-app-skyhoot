'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, X, Plus, Check } from 'lucide-react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { getToken } from '../services/auth'
import { useAuth } from '@/hooks/useAuth'

export default function GetQuestionsByHost() {
  const [questions, setQuestions] = useState([])
  const [newQuestion, setNewQuestion] = useState({
    question: "",
    timeLimit: 30,
    score: 100,
    answerOptions: []
  })
  const [newOption, setNewOption] = useState({
    option: "",
    isCorrect: false
  })
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(true)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [questionToDelete, setQuestionToDelete] = useState(null)
  const token = getToken()
  const router = useRouter()
  
 
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          'https://apiv1.bin.net.tr:8080/api/questions/getQuestionsByHost',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (Array.isArray(response.data.data)) {
          setQuestions(response.data.data)
        } else {
          setQuestions([])
        }
      } catch (error) {
        setQuestions([])
      }
    }

    fetchQuestions()
  }, [token])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setNewQuestion(prev => ({
      ...prev,
      [name]: name === 'timeLimit' || name === 'score' ? parseInt(value) || 0 : value
    }))
  }


  const handleOptionChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewOption(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const addOption = () => {
    if (newOption.option.trim() === "") return
    setNewQuestion(prev => ({
      ...prev,
      answerOptions: [...prev.answerOptions, { ...newOption, id: Date.now() }]
    }))
    setNewOption({ option: "", isCorrect: false })
  }

  const removeOption = (id) => {
    setNewQuestion(prev => ({
      ...prev,
      answerOptions: prev.answerOptions.filter(option => option.id !== id)
    }))
  }

  const handleDeleteQuestion = (questionId) => {
    setQuestionToDelete(questionId)
    setShowDeleteConfirmation(true)
  }
  
  const deleteQuestion = async (questionId) => {
    try {
      await axios.post(
        `https://apiv1.bin.net.tr:8080/api/questions/deleteQuestion?questionId=${questionId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setQuestions(prevQuestions => prevQuestions.filter(q => q.id !== questionId))
      setShowDeleteConfirmation(false)
    } catch (error) {
      console.error("Error deleting question", error)
      setShowDeleteConfirmation(false)
      alert("There was an error deleting the question.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (newQuestion.question.trim() === "" || newQuestion.answerOptions.length < 2) return
  
    try {
      const questionResponse = await axios.post(
        'https://apiv1.bin.net.tr:8080/api/questions/addQuestion',
        {
          question: newQuestion.question,
          timeLimit: newQuestion.timeLimit,
          score: newQuestion.score
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
  
      const questionId = questionResponse.data.data
  
      for (const option of newQuestion.answerOptions) {
        await axios.post(
          'https://apiv1.bin.net.tr:8080/api/answerOptions/addAnswerOption',
          {
            option: option.option,
            isCorrect: option.isCorrect ? 1 : 0,
            questionId: questionId
          },
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
  
      setQuestions(prev => [...prev, { id: questionId, ...newQuestion }])
      setNewQuestion({ question: "", timeLimit: 30, score: 100, answerOptions: [] })
  
    } catch (error) {
      console.error('Error adding question or answer options', error)
    }
  }

  const handleRedirect = (choice) => {
    if (choice === 'create') {
      setShowAddQuestionForm(true)
    } else {
      router.push('/homepage')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-900 text-white">
      <header className="bg-indigo-900 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/homepage" className="text-2xl font-bold flex items-center">
            Skyhoot
          </Link>
          <Link href="/homepage" className="hover:text-yellow-400 transition duration-300 flex items-center">
            <ArrowLeft className="mr-1" /> Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Your Questions</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Question List</h2>
            <div className="space-y-4">
              {questions.length === 0 ? (
                <div className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg">
                  <p className="mb-4">You have no questions. Would you like to create one?</p>
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleRedirect('create')}
                      className="bg-yellow-400 text-indigo-900 px-4 py-2 rounded-full font-semibold hover:bg-yellow-300 transition duration-300"
                    >
                      Yes, create one
                    </button>
                    <button
                      onClick={() => handleRedirect('home')}
                      className="bg-indigo-500 text-white px-4 py-2 rounded-full font-semibold hover:bg-indigo-400 transition duration-300"
                    >
                      No, take me home
                    </button>
                  </div>
                </div>
              ) : (
                questions.map((q) => (
                  <div key={q.id} className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-lg mb-2">{q.question}</p>
                        <p className="text-sm text-yellow-400">Time Limit: {q.timeLimit}s | Score: {q.score}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="text-red-400 hover:text-red-300 transition duration-300"
                        title="Delete question"
                      >
                        <X />
                      </button>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-2">Answer Options:</p>
                      <ul className="space-y-1">
                        {q.answerOptions.map(option => (
                          <li key={option.id} className={`flex items-center ${option.correct ? "text-green-400" : "text-gray-300"}`}>
                            {option.correct && <Check className="mr-2 h-4 w-4" />}
                            {option.option}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Add New Question</h2>
            {showAddQuestionForm && (
              <form onSubmit={handleSubmit} className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg space-y-4">
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-300 mb-1">
                    Question
                  </label>
                  <textarea
                    id="question"
                    name="question"
                    value={newQuestion.question}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 bg-indigo-700 bg-opacity-50 border border-indigo-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-indigo-300"
                    rows={3}
                    placeholder="Enter your question here"
                  />
                </div>
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <label htmlFor="timeLimit" className="block text-sm font-medium text-gray-300 mb-1">
                      Time Limit (seconds)
                    </label>
                    <input
                      type="number"
                      id="timeLimit"
                      name="timeLimit"
                      value={newQuestion.timeLimit}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-indigo-700 bg-opacity-50 border border-indigo-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor="score" className="block text-sm font-medium text-gray-300 mb-1">
                      Score
                    </label>
                    <input
                      type="number"
                      id="score"
                      name="score"
                      value={newQuestion.score}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 bg-indigo-700 bg-opacity-50 border border-indigo-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Answer Options</label>
                  <div className="space-y-2">
                    {newQuestion.answerOptions.map((option, index) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <span className={`flex-grow ${option.isCorrect ? "text-green-400" : "text-gray-300"}`}>
                          {option.option}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeOption(option.id)}
                          className="text-red-400 hover:text-red-300 transition duration-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        name="option"
                        value={newOption.option}
                        onChange={handleOptionChange}
                        className="flex-grow px-3 py-2 bg-indigo-700 bg-opacity-50 border border-indigo-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white placeholder-indigo-300"
                        placeholder="Enter option"
                      />
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          name="isCorrect"
                          checked={newOption.isCorrect}
                          onChange={handleOptionChange}
                          className="form-checkbox h-5 w-5 text-yellow-400 rounded focus:ring-yellow-400 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-300">Correct</span>
                      </label>
                      <button
                        type="button"
                        onClick={addOption}
                        className="bg-yellow-400 text-indigo-900 px-3 py-1 rounded-full font-semibold hover:bg-yellow-300 transition duration-300"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-yellow-400 text-indigo-900 px-6 py-2 rounded-full font-semibold hover:bg-yellow-300 transition duration-300"
                  >
                    Save Question
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-indigo-800 p-6 rounded-lg shadow-lg space-y-4 max-w-sm w-full mx-4">
            <h3 className="text-xl font-semibold text-white">Are you sure you want to delete this question?</h3>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-full hover:bg-gray-400 transition duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteQuestion(questionToDelete)}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-400 transition duration-300"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}