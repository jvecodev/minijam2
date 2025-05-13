"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"

export default function VictoryScreen() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  useEffect(() => {
    // Obter a pontuação da URL
    const scoreParam = searchParams.get("score")
    const finalScore = scoreParam ? Number.parseInt(scoreParam, 10) : 0
    setScore(finalScore)

    // Obter o recorde do localStorage
    const savedHighScore = localStorage.getItem("saturnRunnerHighScore")
    const currentHighScore = savedHighScore ? Number.parseInt(savedHighScore, 10) : 0
    setHighScore(currentHighScore)

    // Atualizar o recorde se necessário
    if (finalScore > currentHighScore) {
      localStorage.setItem("saturnRunnerHighScore", finalScore.toString())
      setHighScore(finalScore)
    }
  }, [searchParams])

  const handlePlayAgain = () => {
    router.push("/game")
  }

  const handleMenu = () => {
    router.push("/menu")
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-700 to-purple-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center px-6"
      >
        <motion.h1 
          className="text-6xl font-bold text-white mb-4"
          animate={{ 
            scale: [1, 1.05, 1],
            textShadow: ["0 0 10px rgba(255,255,255,0.5)", "0 0 20px rgba(255,255,255,0.8)", "0 0 10px rgba(255,255,255,0.5)"]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          VITÓRIA!
        </motion.h1>

        <motion.p 
          className="text-2xl text-blue-200 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          Você destruiu o planeta alienígena e salvou a humanidade!
        </motion.p>

        <motion.div 
          className="mb-8 bg-blue-900 bg-opacity-50 p-6 rounded-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <p className="text-2xl text-white mb-2">
            Pontuação Final: <span className="text-yellow-300">{score}</span>
          </p>
          <p className="text-xl text-gray-300">
            Recorde Atual: <span className="text-yellow-300">{highScore}</span>
          </p>
        </motion.div>

        <motion.div 
          className="space-y-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
        >
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#3182CE" }}
            whileTap={{ scale: 0.95 }}
            className="w-64 py-3 bg-blue-600 text-white rounded-full font-bold text-lg shadow-lg transition-colors"
            onClick={handlePlayAgain}
          >
            Jogar Novamente
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#4C51BF" }}
            whileTap={{ scale: 0.95 }}
            className="w-64 py-3 bg-indigo-700 text-white rounded-full font-bold text-lg shadow-lg transition-colors"
            onClick={handleMenu}
          >
            Menu Principal
          </motion.button>
        </motion.div>
      </motion.div>
      
      {/* Efeito de partículas de vitória */}
      <ParticleEffect />
    </div>
  )
}

// Componente de partículas para efeito de celebração
function ParticleEffect() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(50)].map((_, i) => (
        <motion.div 
          key={i}
          className="absolute w-3 h-3 rounded-full"
          style={{
            background: `rgb(${Math.random() * 155 + 100}, ${Math.random() * 155 + 100}, ${Math.random() * 255})`,
            left: `${Math.random() * 100}vw`,
            top: `${Math.random() * 100}vh`
          }}
          animate={{
            y: [0, -Math.random() * 500 - 200],
            x: [0, (Math.random() - 0.5) * 300],
            opacity: [1, 0],
            scale: [0, Math.random() * 4 + 1, 0]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}
    </div>
  )
}
