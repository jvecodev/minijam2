"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function MainMenu() {
  const router = useRouter()

  const handleStart = () => {
    router.push("/intro")
  }

  const handleHowToPlay = () => {
    router.push("/how-to-play")
  }

  const handleOptions = () => {
    router.push("/options")
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-black">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold text-white mb-2">Ataque a Saturno</h1>
        <p className="text-xl text-purple-300 mb-2">Destrua o planeta dos Saturnídeos</p>
        <p className="text-sm text-purple-400 mb-10">Clique ou pressione uma tecla para ativar o som</p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-64 py-3 bg-purple-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-purple-500 transition-colors"
            onClick={handleStart}
          >
            Iniciar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-64 py-3 bg-purple-800 text-white rounded-full font-bold text-lg shadow-lg hover:bg-purple-700 transition-colors"
            onClick={handleHowToPlay}
          >
            Como Jogar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-64 py-3 bg-purple-900 text-white rounded-full font-bold text-lg shadow-lg hover:bg-purple-800 transition-colors"
            onClick={handleOptions}
          >
            Opções
          </motion.button>
        </div>
      </motion.div>

      <div className="absolute bottom-4 text-purple-400 text-sm">Mini Jam - Tema: Órbita</div>
    </div>
  )
}
