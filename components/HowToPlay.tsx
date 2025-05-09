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
              • Use <span className="bg-gray-700 px-2 py-1 rounded">A</span> e <span className="bg-gray-700 px-2 py-1 rounded">D</span> ou <span className="bg-gray-700 px-2 py-1 rounded">←</span> <span className="bg-gray-700 px-2 py-1 rounded">→</span> para pilotar sua nave ao redor do anel.
            </p>
            <p className="text-gray-200 mt-2">
              • Pressione <span className="bg-gray-700 px-2 py-1 rounded">Espaço</span> para ativar os propulsores e desviar de obstáculos maiores.
            </p>
            <p className="text-gray-200 mt-2">
              • Pressione <span className="bg-gray-700 px-2 py-1 rounded">F</span> ou <span className="bg-gray-700 px-2 py-1 rounded">Clique</span> para disparar torpedos contra o núcleo do planeta.
            </p>
          </div>

          <div>
            <h2 className="text-xl text-blue-300 font-semibold mb-2">Objetivo</h2>
            <p className="text-gray-200">
              Pilote sua nave pelos anéis de Saturno, evitando os destroços e as naves inimigas. Sua principal missão é destruir o núcleo do planeta dos Saturnídeos com seus torpedos de plasma quando ele estiver visível. Cada núcleo precisa ser atingido 3 vezes para ser destruído completamente!
            </p>
          </div>

          <div>
            <h2 className="text-xl text-blue-300 font-semibold mb-2">Itens</h2>
            <ul className="text-gray-200 list-disc pl-5">
              <li>Células de Energia: +50 pontos</li>
              <li>Amplificadores de Velocidade: Aumento temporário da potência dos motores</li>
              <li>Escudos Defletores: Proteção temporária contra inimigos e destroços</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl text-blue-300 font-semibold mb-2">Inimigos e Destroços</h2>
            <ul className="text-gray-200 list-disc pl-5">
              <li>Naves Saturnídeas: Reduzem uma vida ao colidir</li>
              <li>Destroços Espaciais: Diminuem a velocidade da sua nave</li>
              <li>Campos de Força: Use os propulsores para ultrapassá-los!</li>
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
