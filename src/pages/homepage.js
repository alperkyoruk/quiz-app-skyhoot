'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Code, List, PlusCircle, LogOut, User } from 'lucide-react'
import Cookies from 'js-cookie'
import { jwtDecode } from 'jwt-decode'
import { useAuth } from '@/hooks/useAuth'

export default function Dashboard() {
  const [userName, setUserName] = useState('Tech Enthusiast') // Default fallback name

  

  

  useEffect(() => {

    const token = Cookies.get('token') // Assuming your JWT token is stored with the name token
    
    if(!token){
      router.push('/login');
      return;
    }

    if (token) {
      try {
        const decoded = jwtDecode(token)
        // Assuming the JWT contains a sub field for the username
        setUserName(decoded.sub)
      } catch (error) {
        console.error('Failed to decode JWT:', error)
      }
    }
  }, []) // Only run once when the component is mounted

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-900 text-white">
      <header className="bg-indigo-900 shadow-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-bold flex items-center">
            <Code className="mr-2" /> Skyhoot
          </Link>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <User className="mr-2" /> {userName}
            </span>
            <Link href="/logout" className="hover:text-yellow-400 transition duration-300 flex items-center">
              <LogOut className="mr-1" /> Logout
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-12 text-center">Welcome to Your Skyhoot Dashboard, {userName}!</h1>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-10 p-8 rounded-lg shadow-lg backdrop-blur-sm">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <List className="mr-3" /> Your Questions
            </h2>
            <p className="mb-6 text-lg">View and manage the questions you have created for Skyhoot quizzes.</p>
            <Link 
              href="/questionlist" 
              className="bg-yellow-400 text-indigo-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-300 transition duration-300 inline-flex items-center text-lg"
            >
              View Questions
            </Link>
          </div>

          <div className="bg-white bg-opacity-10 p-8 rounded-lg shadow-lg backdrop-blur-sm">
            <h2 className="text-2xl font-semibold mb-6 flex items-center">
              <PlusCircle className="mr-3" /> Create a Game
            </h2>
            <p className="mb-6 text-lg">Start a new Skyhoot game and challenge your fellow tech enthusiasts.</p>
            <Link 
              href="/createGame" 
              className="bg-yellow-400 text-indigo-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-300 transition duration-300 inline-flex items-center text-lg"
            >
              Create Game
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-indigo-900 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 Skyhoot by SKY LAB, Yildiz Technical University. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}