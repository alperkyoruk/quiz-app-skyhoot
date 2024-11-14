'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Award } from 'lucide-react'

const GameLeaderboard = ({ leaderboard }) => {
  // Ensure we display only the available players, not exceeding 5 players
  const topPlayers = leaderboard.slice(0, 5)

  const podiumOrder = [0, 1, 2, 3, 4].slice(0, topPlayers.length) // Only use the number of players available

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-500 to-indigo-600 text-white py-12 px-4">
      <h1 className="text-4xl font-bold text-center mb-12">Final Leaderboard</h1>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-end mb-16 h-80">
          {podiumOrder.map((index, order) => (
            <motion.div
              key={index}
              className={`w-1/5 mx-2 flex flex-col items-center justify-end ${
                index === 3 || index === 4 ? 'self-center' : ''
              }`}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: order * 0.2 }}
            >
              {/* Name and score above the bars */}
              <div className="text-center mb-2 z-10 relative">
                <p className="font-bold">{topPlayers[index].playerName}</p>
                <p className="text-yellow-300">{topPlayers[index].score} pts</p>
              </div>

              {/* The podium bar */}
              <motion.div
                className={`w-full rounded-t-lg relative ${
                  index === 0
                    ? 'bg-yellow-400'
                    : index === 1
                    ? 'bg-gray-300'
                    : index === 2
                    ? 'bg-yellow-600'
                    : 'bg-indigo-700'
                }`}
                initial={{ height: 0 }}
                animate={{
                  height: index === 0 ? 256 : index === 1 ? 224 : index === 2 ? 192 : 96,
                }}
                transition={{ duration: 0.8, delay: order * 0.2 }}
              >
                {index < 3 && (
                  <div className="flex justify-center items-center absolute top-0 left-0 right-0 z-20">
                    {index === 0 ? (
                      <Trophy className="w-12 h-12 text-yellow-400" />
                    ) : (
                      <Award
                        className={`w-10 h-10 ${index === 1 ? 'text-gray-300' : 'text-yellow-600'}`}
                      />
                    )}
                  </div>
                )}
                <p className="text-indigo-900 font-bold text-xl mt-2 absolute bottom-2 left-1/2 transform -translate-x-1/2">
                  {index === 3 ? '4th' : index === 4 ? '5th' : index + 1}
                </p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default GameLeaderboard
