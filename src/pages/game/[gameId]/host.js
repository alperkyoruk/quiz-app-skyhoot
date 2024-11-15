'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import axios from 'axios'
import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { Code, Play, Users, Clock, ChevronRight, Award } from 'lucide-react'
import GameLeaderboard from '@/components/GameLeaderboard'
import { getToken } from '@/services/auth'
import { useAuth } from '@/hooks/useAuth'

export default function HostGamePage() {
  const params = useParams()
  const gameId = params.gameId

  const [gameData, setGameData] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [timeLeft, setTimeLeft] = useState(30)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameCode, setGameCode] = useState('')
  const [players, setPlayers] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [isNextQuestionReady, setIsNextQuestionReady] = useState(false)
  const [showFinalLeaderboard, setShowFinalLeaderboard] = useState(false)
  const timerRef = useRef(null)
  const processingQuestion = useRef(false)
  const token = getToken()

  useEffect(() => {
    if (!gameId) return
    fetchGameDetails()
    initializeWebSocket()
  }, [gameId])

  const fetchGameDetails = async () => {
    if (!gameId) return

    try {
      const response = await axios.get(`http://localhost:8080/api/games/getGameById?gameId=${gameId}`)
      const gameDetails = response.data.data
      setGameData(gameDetails)
      setGameCode(gameDetails.gameCode)
    } catch (error) {
      console.error('Error fetching game details:', error)
    }
  }

  const initializeWebSocket = () => {
    if (!gameId) return

    console.log("Initializing WebSocket connection...")

    const socketClient = new Client({
      brokerURL: 'ws://localhost:8080/ws',
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        console.log("Connected to WebSocket!")

        socketClient.subscribe(`/topic/game/${gameId}`, (message) => {
          const messageBody = JSON.parse(message.body)
          if (messageBody.content === "Game has started.") {
            setGameStarted(true)
            fetchGameData()
          } else if (messageBody.content.includes("has joined the game")) {
            updatePlayerList(messageBody.content)
          } else {
            handleNewQuestion(messageBody.content)
          }
        })
      },
      onStompError: (error) => {
        console.error("WebSocket connection error:", error)
      },
    })

    socketClient.activate()
  }

  const updatePlayerList = (message) => {
    const playerName = message.split(" ")[1]
    setPlayers((prevPlayers) => [...prevPlayers, playerName])
  }

  const fetchGameData = async () => {
    if (!gameId) return

    try {
      const response = await axios.get(`http://localhost:8080/api/games/getGameStarted?gameId=${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const gameData = response.data.data
      setGameData(gameData)
      setCurrentQuestion(gameData.currentQuestion)
    } catch (error) {
      console.error('Error fetching game data:', error)
    }
  }

  const handleNewQuestion = (questionData) => {
    if(questionData == null){
      renderFinalLeaderboard()
    }
    setCurrentQuestion({
      question: questionData.question,
      answerOptions: questionData.answerOptions,
    })
    setCurrentQuestion(questionData)
    setTimeLeft(questionData.timeLimit || 30)
    startTimer()
    setShowLeaderboard(false)
    setIsNextQuestionReady(false)
  }

  const fetchLeaderboard = async () => {
    try {
      clearInterval(timerRef.current)
      const response = await axios.get(`http://localhost:8080/api/games/getLeaderboard?gameId=${gameId}`)
      setLeaderboard(response.data.data)
      setShowLeaderboard(true)
      setIsNextQuestionReady(true)
      processingQuestion.current = false
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
    }
  }

  const startGame = async () => {
    if (!gameId) return

    try {
      await axios.post(`http://localhost:8080/api/games/startGame?gameId=${gameId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (error) {
      console.error('Error starting game:', error)
    }
  }

  const endGame = async () => {
    if (!gameId) return

    try {
      await axios.post(`http://localhost:8080/api/games/endGame?gameId=${gameId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (error) {
      console.error('Error ending game:', error)
    }
  }

  const sendNextQuestion = async () => {
    if (!gameId) return

    try {
      const response = await axios.post(`http://localhost:8080/api/games/getNextQuestion?gameId=${gameId}`)
      if(response.data.data == null){
        setShowFinalLeaderboard(true)
        setTimeout(() => {
          endGame()
        }, 10000)
      }
      else {
        const questionData = response.data.data.currentQuestion
        handleNewQuestion(questionData)
      }
    } catch (error) {
      console.error('Error fetching next question:', error)
    }
  }

  const startTimer = () => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timerRef.current)
          fetchLeaderboard()
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
  }

  useEffect(() => {
    if (gameStarted && currentQuestion) {
      startTimer()
    }
    return () => clearInterval(timerRef.current)
  }, [gameStarted, currentQuestion])

  const handleNextClick = () => {
    if (showLeaderboard) {
      sendNextQuestion()
    } else {
      fetchLeaderboard()
    }
  }

  return (
    <div className="game-container">
      {showFinalLeaderboard ? (
        <GameLeaderboard leaderboard={leaderboard} />
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-900 text-white">
          <header className="bg-indigo-900 shadow-md">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
              <div className="text-2xl font-bold flex items-center">
                <Code className="mr-2" /> Skyhoot
              </div>
              <div className="text-xl font-semibold">Host Game</div>
            </div>
          </header>

          <main className="container mx-auto px-4 py-8">
            <div className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg text-center mb-8 backdrop-blur-sm">
              <h2 className="text-2xl font-semibold mb-2">Game Code:</h2>
              <p className="text-4xl font-bold text-yellow-400">{gameCode}</p>
            </div>

            {gameStarted ? (
              <div className="bg-white bg-opacity-10 p-6 rounded-lg shadow-lg backdrop-blur-sm">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center">
                      <Users className="mr-2" /> Players:
                    </h2>
                    <ul className="space-y-2">
                      {players.map((player, index) => (
                        <li key={index} className="bg-indigo-700 bg-opacity-50 rounded-lg p-2 text-center">
                          {player}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    {showLeaderboard ? (
                      <div>
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                          <Award className="mr-2" /> Leaderboard:
                        </h2>
                        <ul className="space-y-2">
                          {leaderboard.map((player, index) => (
                            <li key={index} className="bg-indigo-700 bg-opacity-50 rounded-lg p-2 flex justify-between">
                              <span>{player.playerName}</span>
                              <span className="font-bold">{player.score}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Current Question:</h2>
                        <p className="text-lg mb-4">{currentQuestion?.question}</p>
                        <ul className="space-y-2">
                          {currentQuestion?.answerOptions?.map((option) => (
                            <li key={option} className="bg-indigo-700 bg-opacity-50 rounded-lg p-2">
                              {option}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    className="bg-indigo-600 px-6 py-2 rounded-lg text-white font-bold hover:bg-indigo-700 transition"
                    onClick={handleNextClick}
                  >
                    {showLeaderboard ? 'Next Question' : 'Show Leaderboard'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  className="bg-indigo-600 px-6 py-2 rounded-lg text-white font-bold hover:bg-indigo-700 transition"
                  onClick={startGame}
                >
                  Start Game
                </button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}
