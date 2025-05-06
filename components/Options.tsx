"use client"

import type React from "react"

import { motion } from "framer-motion"
import { useState } from "react"

interface OptionsProps {
  volume: number
  setVolume: (volume: number) => void
  onBack: () => void
}

export default function Options({ volume, setVolume, onBack }: OptionsProps) {
  const [localVolume, setLocalVolume] = useState(volume)

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setLocalVolume(newVolume)
  }

  const handleSave = () => {
    setVolume(localVolume)
    onBack()
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-indigo-900 to-black">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center w-80"
      >
        <h1 className="text-3xl font-bold text-white mb-8">Opções</h1>

        <div className="mb-8">
          <label className="block text-white text-xl mb-4">Volume</label>
          <div className="flex items-center">
            <span className="text-white mr-3">0%</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={localVolume}
              onChange={handleVolumeChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-white ml-3">100%</span>
          </div>
          <div className="text-center mt-2 text-white">{Math.round(localVolume * 100)}%</div>
        </div>

        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-64 py-3 bg-indigo-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-indigo-500 transition-colors"
            onClick={handleSave}
          >
            Salvar
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-64 py-3 bg-gray-700 text-white rounded-full font-bold text-lg shadow-lg hover:bg-gray-600 transition-colors"
            onClick={onBack}
          >
            Cancelar
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
