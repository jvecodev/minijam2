"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import IntroPage from "./intro/page";

// Importação dinâmica do componente GameSketch para evitar problemas de SSR
const DynamicGameSketch = dynamic(() => import("@/components/GameSketch"), {
  ssr: false,
  loading: () => <div className="loading">Carregando jogo...</div>,
});

export default function Home() {
  const router = useRouter();
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // Manipulador para iniciar o jogo
  const startGame = () => {
    setGameStarted(true);
  };

  // Manipulador para game over
  const handleGameOver = () => {
    setGameStarted(false);
    setScore(0);
    setLives(3);
    setLevel(1);
  };

  // Manipulador de tecla para pausar
  useEffect(() => {
    if (gameStarted) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsPaused((prev) => !prev);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [gameStarted]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-purple-900 to-black">
      {!gameStarted ? (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold text-white mb-6">
            Ataque a Saturno
          </h1>
          <p className="text-xl text-purple-300 mb-2">
            Destrua o planeta dos Saturnídeos
          </p>

          <div className="space-y-4">
            <button
              onClick={startGame}
              className="block w-64 py-3 bg-purple-600 text-white rounded-full font-bold text-lg shadow-lg hover:bg-purple-500 transition-colors mx-auto text-center"
            >
              Iniciar Jogo
            </button>
          </div>

          <div className="mt-8 text-purple-400 text-sm">
            <p className="mb-2">Como jogar:</p>
            <p>Use as setas ← → ou A D para se mover</p>
            <p>Pressione Espaço para pular</p>
            <p>Pressione ESC para pausar</p>
          </div>
        </motion.div>
      ) : (
        <div className="w-full h-screen">
          <div className="absolute top-4 left-4 z-10 flex space-x-4 text-white">
            <div>Pontos: {score}</div>
            <div>Vidas: {lives}</div>
            <div>Nível: {level}</div>
            {isPaused && <div className="text-yellow-300">PAUSADO</div>}
          </div>
          <IntroPage />
          <DynamicGameSketch
            updateScore={setScore}
            updateLives={setLives}
            updateLevel={setLevel}
            isPaused={isPaused}
            initialLives={lives}
            initialScore={score}
            initialLevel={level}
            onGameOver={handleGameOver}
          />
          {isPaused && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="bg-purple-900 p-6 rounded-lg text-white text-center">
                <h2 className="text-2xl mb-4">Jogo Pausado</h2>
                <button
                  onClick={() => setIsPaused(false)}
                  className="bg-purple-600 px-4 py-2 rounded hover:bg-purple-500"
                >
                  Continuar
                </button>
                <button
                  onClick={handleGameOver}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-500 ml-4"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="absolute bottom-4 text-purple-400 text-sm">
        Mini Jam - Tema: Órbita
      </div>
    </main>
  );
}
