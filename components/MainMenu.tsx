"use client"

import { motion } from "framer-motion"

interface MainMenuProps {
  onStart: () => void
  onHowToPlay: () => void
  onOptions: () => void
}

export default function MainMenu({ onStart, onHowToPlay, onOptions }: MainMenuProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-black">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h1 className="text-5xl font-bold text-white mb-2">Saturn Rings Runner</h1>
        <p className="text-xl text-purple-300 mb-2">Um endless runner orbital</p>
        <p className="text-sm text-purple-400 mb-10">Clique ou pressione uma tecla para ativar o som</p>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-64 py-3 bg-purple-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-purple-500 transition-colors"
            onClick={onStart}
          >
            Iniciar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-64 py-3 bg-purple-800 text-white rounded-full font-bold text-lg shadow-lg hover:bg-purple-700 transition-colors"
            onClick={onHowToPlay}
          >
            Como Jogar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-64 py-3 bg-purple-900 text-white rounded-full font-bold text-lg shadow-lg hover:bg-purple-800 transition-colors"
            onClick={onOptions}
          >
            Opções
          </motion.button>
        </div>
      </motion.div>

      <div className="absolute bottom-4 text-purple-400 text-sm">Mini Jam - Tema: Órbita</div>
    </div>
  )
}
