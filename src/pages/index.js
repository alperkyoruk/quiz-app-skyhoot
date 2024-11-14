import Link from 'next/link'
import { ArrowRight, Code, Users, Zap, Laptop } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 to-indigo-900 text-white">
      <header className="container mx-auto px-4 py-8">
        <nav className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Skyhoot</h1>
          <div className="space-x-4">
            <Link href="/login" className="hover:underline">Login</Link>
            <Link href="/register" className="bg-white text-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-opacity-90 transition duration-300">
              Sign Up
            </Link>
            <Link href="/join" className="hover:underline text-yellow-400">Join Game</Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4">
        <section className="text-center py-20">
          <h2 className="text-5xl font-bold mb-6 animate-fade-in-up">Elevate Your Knowledge with Skyhoot!</h2>
          <p className="text-xl mb-8 animate-fade-in-up animation-delay-200">Embark on an exciting quiz adventure crafted by SKY LAB, your premier computer science club.</p>
          <Link href="/register" className="bg-yellow-400 text-indigo-800 px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-300 transition duration-300 inline-flex items-center animate-fade-in-up animation-delay-400">
            Get Started <ArrowRight className="ml-2" />
          </Link>
        </section>

        <section className="py-20">
          <h3 className="text-3xl font-bold text-center mb-12">Why Choose Skyhoot?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Code, title: "Expand Your Tech Knowledge", description: "Challenge yourself with quizzes covering a wide spectrum of computer science topics." },
              { icon: Users, title: "Connect with Tech Enthusiasts", description: "Engage with fellow computer science aficionados and quiz masters worldwide." },
              { icon: Zap, title: "Real-time Excitement", description: "Experience the thrill of live quizzes with instant feedback and results." },
            ].map((feature, index) => (
              <div key={index} className="bg-white bg-opacity-10 p-6 rounded-lg text-center hover:bg-opacity-20 transition duration-300 transform hover:scale-105">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                <h4 className="text-xl font-semibold mb-2">{feature.title}</h4>
                <p className="text-purple-200">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20">
          <h3 className="text-3xl font-bold text-center mb-12">Your Skyhoot Journey</h3>
          <div className="max-w-3xl mx-auto">
            {[
              "Sign up and create your Skyhoot profile",
              "Design your own tech quizzes or explore existing challenges",
              "Invite your friends or join public quiz rooms",
              "Navigate through questions with speed and accuracy to score points",
              "Climb the leaderboards and showcase your tech expertise",
            ].map((step, index) => (
              <div key={index} className="flex items-center mb-6">
                <div className="bg-yellow-400 text-indigo-800 w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4">
                  {index + 1}
                </div>
                <p className="text-lg">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-20 text-center">
          <h3 className="text-3xl font-bold mb-6">Join the Skyhoot Community</h3>
          <div className="flex justify-center items-center space-x-12 mb-8">
            <div>
              <p className="text-4xl font-bold mb-2">500K+</p>
              <p className="text-purple-200">Active Users</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">2M+</p>
              <p className="text-purple-200">Quizzes Created</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-2">50+</p>
              <p className="text-purple-200">Countries Represented</p>
            </div>
          </div>
          <p className="text-xl mb-8">"Skyhoot has transformed learning into an exhilarating journey through the world of technology!"</p>
          <p className="font-semibold">- SKY LAB Innovation Report</p>
        </section>

        <section className="py-20 text-center">
          <h3 className="text-4xl font-bold mb-8">Ready to Challenge Yourself?</h3>
          <Link href="/register" className="bg-yellow-400 text-indigo-800 px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-300 transition duration-300 inline-flex items-center">
            Begin Your Skyhoot Adventure <Laptop className="ml-2" />
          </Link>
        </section>
      </main>

      <footer className="bg-indigo-900 py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2023 Skyhoot by SKY LAB. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}