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

// Import chart library
import { Bar } from 'react-chartjs-2'
import Chart from 'chart.js/auto'

export default function HostGamePage() {
  const params = useParams()
  const gameId = params?.gameId

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
  const [showAnswerChart, setShowAnswerChart] = useState(false)
  const [answerCounts, setAnswerCounts] = useState([])
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
      const response = await axios.get(`https://api.bin.net.tr:8081/api/games/getGameById?gameId=${gameId}`)
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
      webSocketFactory: () => new SockJS('https://api.bin.net.tr:8081/ws'),
      onConnect: () => {
        console.log("Connected to WebSocket!")

        socketClient.subscribe(`/topic/game/${gameId}`, (message) => {
          const messageBody = JSON.parse(message.body)
          if (messageBody.content === "Game has started.") {
            setGameStarted(true)
            fetchGameData()
          } else if (messageBody.content.includes("has joined the game.")) {
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
    const playerName = message.split(" ")[1] // Extract player name
    setPlayers((prevPlayers) => [...prevPlayers, playerName])
  }

  const fetchGameData = async () => {
    if (!gameId) return

    try {
      const response = await axios.get(`https://api.bin.net.tr:8081/api/games/getGameStarted?gameId=${gameId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const gameData = response.data.data
      setGameData(gameData)
      setCurrentQuestion({
        ...gameData.currentQuestion,
        questionId: gameData.currentQuestion.id,
      })
    } catch (error) {
      console.error('Error fetching game data:', error)
    }
  }

  const handleNewQuestion = (questionData) => {
    if (questionData == null) {
      renderFinalLeaderboard()
    }
    setCurrentQuestion({
      question: questionData.question,
      answerOptions: questionData.answerOptions,
      questionId: questionData.id,
    })
    setTimeLeft(questionData.timeLimit || 30)
    startTimer()
    setShowLeaderboard(false)
    setShowAnswerChart(false)
    setIsNextQuestionReady(false)
  }

  const fetchAnswerCounts = async () => {
    try {
      const questionId = currentQuestion?.questionId
      if (!questionId) return

      const response = await axios.get(`https://api.bin.net.tr:8081/api/answerOptions/getAnswerOptionsByQuestionId?questionId=${questionId}`,{},
      { headers: { Authorization: `Bearer ${token}` } }
      )
      if (response.data.success) {
        setAnswerCounts(response.data.data)
        setShowAnswerChart(true)
      } else {
        console.error('Failed to get answer counts:', response.data.message)
      }
    } catch (error) {
      console.error('Error fetching answer counts:', error)
    }
  }

  const fetchLeaderboard = async () => {
    try {
      const response = await axios.get(`https://api.bin.net.tr:8081/api/games/getLeaderboard?gameId=${gameId}`)
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
      await axios.post(`https://api.bin.net.tr:8081/api/games/startGame?gameId=${gameId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (error) {
      console.error('Error starting game:', error)
    }
  }

  const endGame = async () => {
    if (!gameId) return

    try {
      await axios.post(`https://api.bin.net.tr:8081/api/games/endGame?gameId=${gameId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch (error) {
      console.error('Error ending game:', error)
    }
  }

  const sendNextQuestion = async () => {
    if (!gameId) return

    try {
      const response = await axios.post(`https://api.bin.net.tr:8081/api/games/getNextQuestion?gameId=${gameId}`,{},{
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.data.data == null) {
        setShowFinalLeaderboard(true)
        setTimeout(() => {
          endGame()
        }, 10000)
      } else {
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
          // After time runs out, fetch answer counts
          fetchAnswerCounts()
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
    } else if (showAnswerChart) {
      fetchLeaderboard()
    } else {
      // If time is still running, stop it and fetch answer counts
      clearInterval(timerRef.current)
      fetchAnswerCounts()
    }
  }
  // Prepare data for the chart
  const chartData = {
    labels: answerCounts.map((option) => option.option),
    datasets: [
      {
        label: 'Number of Players',
        data: answerCounts.map((option) => option.playerCount),
        backgroundColor: 'rgba(255, 205, 86, 0.6)', // Yellow color
      },
    ],
  }
  const chartOptions = {
    scales: {
      x: {
        ticks: {
          color: 'white', // White text color
        },
      },
      y: {
        ticks: {
          color: 'white', // White text color
          callback: function(value) {
            return Number(value).toFixed(0); // Remove decimal points
          },
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: 'white', // White text color
        },
      },
    },
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
                    {showAnswerChart ? (
                      <div>
                        <h2 className="text-xl font-semibold mb-4">Answer Breakdown:</h2>
                        <Bar data={chartData} />
                      </div>
                    ) : showLeaderboard ? (
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
                            <li key={option.id} className="bg-indigo-700 bg-opacity-50 rounded-lg p-2 text-center">
                              {option.option}
                            </li>
                          ))}
                        </ul>
                        <div className="mt-4 flex items-center justify-center text-yellow-400">
                          <Clock className="mr-2" />
                          <span className="text-3xl font-bold">{timeLeft}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleNextClick}
                    className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold py-2 px-4 rounded-full flex items-center transition duration-300"
                  >
                    {showLeaderboard
                      ? 'Next Question'
                      : showAnswerChart
                      ? 'Show Leaderboard'
                      : 'Show Answer Chart'}{' '}
                    <ChevronRight className="ml-2" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <button
                  onClick={startGame}
                  className="bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-semibold py-3 px-8 rounded-full flex items-center mx-auto transition duration-300"
                >
                  <Play className="mr-2" /> Start Game
                </button>
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  )
}