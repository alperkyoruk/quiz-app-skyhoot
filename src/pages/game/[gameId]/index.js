'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import axios from 'axios'
import Cookies from 'js-cookie'
import { Code, Clock, Lock, Loader2, CheckCircle2 } from 'lucide-react'

export default function PlayerGamePage() {
  const params = useParams()
  const gameId = params?.gameId

  // State variables
  const [question, setQuestion] = useState(null)
  const [selectedOption, setSelectedOption] = useState(null)
  const [locked, setLocked] = useState(false)
  const [timeLeft, setTimeLeft] = useState(30)
  const [client, setClient] = useState(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [showWaitingScreen, setShowWaitingScreen] = useState(false)
  const [isLastQuestion, setIsLastQuestion] = useState(false)  // New state for last question check

  // Initialize WebSocket connection
  useEffect(() => {
    if (gameId) {
      initializeWebSocket()
    }
  }, [gameId])

  const initializeWebSocket = () => {
    const socketClient = new Client({
      brokerURL: 'ws://apiv1.bin.net.tr:8081/ws',
      webSocketFactory: () => new SockJS('https://apiv1.bin.net.tr:8081/ws'),
      onConnect: () => {
        socketClient.subscribe(`/topic/game/${gameId}`, (message) => {
          const messageBody = JSON.parse(message.body)
          

          if (messageBody.content === "Game has started.") {
            setGameStarted(true)
          } else if (messageBody.currentQuestion) {
            setQuestion(messageBody.currentQuestion)
            resetQuestionState(messageBody)
          } else if (messageBody.nextQuestion) {
            setQuestion(messageBody.nextQuestion)
            resetQuestionState(messageBody.nextQuestion)
          }
        })
      },
    })
    socketClient.activate()
    setClient(socketClient)
  }

  const resetQuestionState = (messageBody) => {
    setSelectedOption(null)
    setLocked(false)
    setTimeLeft(messageBody.currentQuestion.timeLimit || 30)
    setShowWaitingScreen(false)
    setIsLastQuestion(messageBody.currentQuestion.sequenceNumber === messageBody.questionCount)  // Check if it's the last question
  }

  // Timer for the question
  useEffect(() => {
    if (question) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer)
            setShowWaitingScreen(true)
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [question])

  const handleOptionSelect = (optionId) => {
    if (!locked) {
      setSelectedOption(optionId)
    }
  }

  const handleLockAnswer = async () => {
    if (selectedOption && !locked) {
      setLocked(true)
      const playerId = Cookies.get('playerId')
      const timeTaken = 30 - timeLeft

      try {
        await axios.post('https://apiv1.bin.net.tr:8081/api/playerAnswers/addPlayerAnswer', {
          playerId,
          gameId,
          questionId: question.id,
          answerOptionId: selectedOption,
          timeTaken,
        })
        setShowWaitingScreen(true)

        // If it's the last question, show the congratulations message
        if (isLastQuestion) {
          setShowWaitingScreen(true)
        }
      } catch (error) {
        console.error("Error sending answer:", error)
      }
    }
  }

  if (!gameId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-600 to-indigo-900 text-white">
        <p className="text-xl font-semibold">Invalid game ID. Please check your link and try again.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-900 text-white">
      <header className="bg-indigo-900 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold flex items-center">
            <Code className="mr-2" /> Skyhoot
          </div>
          <div className="text-xl font-semibold">Player Game</div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        {gameStarted ? (
          showWaitingScreen ? (
            isLastQuestion ? (
              <div className="w-full max-w-md bg-white bg-opacity-10 p-6 rounded-lg shadow-lg text-center backdrop-blur-sm">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-2xl font-semibold mb-4">Congratulations!</h2>
                <p className="text-lg">Look at the screen for your score!</p>
              </div>
            ) : (
              <div className="w-full max-w-md bg-white bg-opacity-10 p-6 rounded-lg shadow-lg text-center backdrop-blur-sm">
                <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-yellow-400" />
                <h2 className="text-2xl font-semibold mb-4">Answer Submitted!</h2>
                <p className="text-lg">Waiting for the next question...</p>
                <Loader2 className="animate-spin h-8 w-8 mx-auto mt-4" />
              </div>
            )
          ) : question ? (
            <div className="w-full max-w-md bg-white bg-opacity-10 p-6 rounded-lg shadow-lg backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-4">{question.question}</h2>
              <ul className="space-y-2">
                {question.answerOptions?.map((option) => (
                  <li key={option.id}>
                    <button
                      className={`w-full py-3 px-4 rounded-lg font-medium transition duration-300 ${
                        selectedOption === option.id
                          ? 'bg-yellow-400 text-indigo-900'
                          : 'bg-indigo-700 bg-opacity-50 hover:bg-opacity-70'
                      } ${locked ? 'cursor-not-allowed opacity-50' : ''}`}
                      onClick={() => handleOptionSelect(option.id)}
                      disabled={locked}
                    >
                      {option.option} {selectedOption === option.id && locked && <Lock className="inline-block ml-2" size={16} />}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex items-center justify-center text-yellow-400">
                <Clock className="mr-2" />
                <span className="text-xl font-semibold">{timeLeft} seconds</span>
              </div>
              <button
                className={`mt-6 w-full py-3 px-4 rounded-full font-semibold transition duration-300 ${
                  !selectedOption || locked
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-yellow-400 text-indigo-900 hover:bg-yellow-300'
                }`}
                onClick={handleLockAnswer}
                disabled={!selectedOption || locked}
              >
                {locked ? "Answer Locked" : "Lock Answer"}
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Loader2 className="animate-spin h-12 w-12 mx-auto mb-4" />
              <p className="text-xl font-semibold">Loading question...</p>
            </div>
          )
        ) : (
          <div className="w-full max-w-md bg-white bg-opacity-10 p-6 rounded-lg shadow-lg text-center backdrop-blur-sm">
            <h1 className="text-3xl font-bold mb-4">You are In!</h1>
            <p className="text-lg">Waiting for the host to start the game...</p>
            <Loader2 className="animate-spin h-8 w-8 mx-auto mt-4" />
          </div>
        )}
      </main>

      <footer className="bg-indigo-900 py-4 mt-12">
        <div className="container mx-auto text-center text-white">
          <p className="text-lg">&copy; 2024 Skyhoot - All rights reserved</p>
        </div>
      </footer>
    </div>
  )
}
