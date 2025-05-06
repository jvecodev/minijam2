"use client"

import { motion } from "framer-motion"

interface HowToPlayProps {
  onBack: () => void
}

export default function HowToPlay({ onBack }: HowToPlayProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-blue-900 to-black p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl text-center"
      >
        <h1 className="text-3xl font-bold text-white mb-6">Como Jogar</h1>

        <div className="text-left space-y-4 mb-8">
          <div>
            <h2 className="text-xl text-blue-300 font-semibold mb-2">Controles</h2>
            <p className="text-gray-200">
              • Pressione <span className="bg-gray-700 px-2 py-1 rounded">Espaço</span> para pular sobre obstáculos e
              fendas.
            </p>
          </div>

          <div>
            <h2 className="text-xl text-blue-300 font-semibold mb-2">Objetivo</h2>
            <p className="text-gray-200">
              Corra pelos anéis de Saturno o máximo que puder, evitando obstáculos e coletando itens. A cada volta
              completa, a dificuldade aumenta!
            </p>
          </div>

          <div>
            <h2 className="text-xl text-blue-300 font-semibold mb-2">Itens</h2>
            <ul className="text-gray-200 list-disc pl-5">
              <li>Cristais Espaciais: +50 pontos</li>
              <li>Turbinas de Impulso: Aumento temporário de velocidade</li>
              <li>Escudos: Proteção temporária contra obstáculos</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl text-blue-300 font-semibold mb-2">Obstáculos</h2>
            <ul className="text-gray-200 list-disc pl-5">
              <li>Meteoritos: Reduzem uma vida ao colidir</li>
              <li>Pedaços de Gelo: Diminuem sua velocidade</li>
              <li>Fendas no Anel: Pule sobre elas para não cair!</li>
            </ul>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-2 bg-blue-700 text-white rounded-full font-bold text-lg shadow-lg hover:bg-blue-600 transition-colors"
          onClick={onBack}
        >
          Voltar
        </motion.button>
      </motion.div>
    </div>
  )
}
