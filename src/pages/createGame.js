'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { getToken } from '../services/auth'
import { Code, ArrowLeft, Play, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

export default function CreateGame() {
  const [questions, setQuestions] = useState([])
  const [selectedQuestions, setSelectedQuestions] = useState([])
  const [maxPlayers, setMaxPlayers] = useState(20)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const token = getToken()
  const router = useRouter()

  
  useEffect(() => {
  
    
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(
          'https://api.bin.net.tr:8081/api/questions/getQuestionsByHost',
          { headers: { Authorization: `Bearer ${token}` } }
        )
        if (Array.isArray(response.data.data)) {
          setQuestions(response.data.data)
          setIsLoading(false)
        } else {
          setQuestions([])
          setIsLoading(false)
        }
      } catch (error) {
        setQuestions([])
        setError('Failed to fetch questions. Please try again.')
        setIsLoading(false)
        console.error('Error fetching questions:', error)
      }
    }

    fetchQuestions()
  }, [token])

  const handleCheckboxChange = (questionId) => {
    setSelectedQuestions((prevSelected) => {
      if (prevSelected.includes(questionId)) {
        return prevSelected.filter((id) => id !== questionId)
      } else {
        return [...prevSelected, questionId]
      }
    })
  }

  const handleCreateGame = async () => {
    if (selectedQuestions.length === 0) {
      alert('Please select at least one question!')
      return
    }

    const gameData = {
      maxPlayers,
      questionIds: selectedQuestions,
    }

    try {
      const response = await axios.post('https://api.bin.net.tr:8081/api/games/addGame', gameData, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const gameId = response.data.data
      await new Promise((resolve) => setTimeout(resolve, 3000))
      router.push(`/game/${gameId}/host`)
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Failed to create game. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-900 text-white">
      <header className="bg-indigo-900 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/homepage" className="text-2xl font-bold flex items-center">
            <Code className="mr-2" /> Skyhoot
          </Link>
          <Link href="/homepage" className="hover:text-yellow-400 transition duration-300 flex items-center">
            <ArrowLeft className="mr-1" /> Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Create a New Game</h1>

        {isLoading ? (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin mr-2" />
            <p>Loading questions...</p>
          </div>
        ) : error ? (
          <p className="text-red-400 bg-red-900 bg-opacity-20 p-4 rounded-lg">{error}</p>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="maxPlayers" className="block text-sm font-medium text-gray-300 mb-1">
                Max Players
              </label>
              <input
                type="number"
                id="maxPlayers"
                value={maxPlayers}
                onChange={(e) => setMaxPlayers(Number(e.target.value))}
                min="1"
                className="w-full px-3 py-2 bg-indigo-700 bg-opacity-50 border border-indigo-500 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 text-white"
              />
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Select Questions</h2>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {questions.length > 0 ? (
                  questions.map((question) => (
                    <div key={question.id} className="flex items-center space-x-2 bg-indigo-800 bg-opacity-50 p-3 rounded-lg">
                      <input
                        type="checkbox"
                        id={`question-${question.id}`}
                        checked={selectedQuestions.includes(question.id)}
                        onChange={() => handleCheckboxChange(question.id)}
                        className="form-checkbox h-5 w-5 text-yellow-400 rounded focus:ring-yellow-400 focus:ring-offset-0"
                      />
                      <label htmlFor={`question-${question.id}`} className="text-sm flex-grow">
                        {question.question}
                      </label>
                      <span className="text-xs text-yellow-400">
                        Time: {question.timeLimit}s | Score: {question.score}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 bg-indigo-800 bg-opacity-50 p-4 rounded-lg">No questions available. Please add some questions first.</p>
                )}
              </div>
            </div>

            <button
              onClick={handleCreateGame}
              className="w-full bg-yellow-400 text-indigo-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-300 transition duration-300 flex items-center justify-center"
            >
              <Play className="mr-2" /> Create Game
            </button>
          </div>
        )}
      </main>

      <footer className="bg-indigo-900 py-4 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 Skyhoot by SKY LAB, Yildiz Technical University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}