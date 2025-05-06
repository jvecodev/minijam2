"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"

export default function GameOverScreen() {
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

  const handleRestart = () => {
    router.push("/game")
  }

  const handleMenu = () => {
    router.push("/menu")
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-red-900 to-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold text-white mb-6">Game Over</h1>

        <div className="mb-8">
          <p className="text-2xl text-white mb-2">
            Pontuação: <span className="text-yellow-400">{score}</span>
          </p>
          <p className="text-xl text-gray-300">
            Recorde: <span className="text-yellow-400">{highScore}</span>
          </p>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-64 py-3 bg-red-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-red-500 transition-colors"
            onClick={handleRestart}
          >
            Tentar Novamente
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-64 py-3 bg-gray-700 text-white rounded-full font-bold text-lg shadow-lg hover:bg-gray-600 transition-colors"
            onClick={handleMenu}
          >
            Menu Principal
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
