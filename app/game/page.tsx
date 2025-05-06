"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
// Não importamos o GameSketch diretamente, apenas de forma dinâmica

// Importação dinâmica do componente P5 para evitar problemas de SSR
const DynamicGameSketch = dynamic(
  () => import("@/components/GameSketch"),
  {
    ssr: false, // Garantir que não seja renderizado no servidor
    loading: () => <div className="loading">Carregando jogo...</div>
  }
)

export default function GamePage() {
  const router = useRouter()
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [level, setLevel] = useState(1)
  const [isPaused, setIsPaused] = useState(false)
  const [isGameOver, setIsGameOver] = useState(false)
  const [isBrowser, setIsBrowser] = useState(false)

  // Detectar se estamos no navegador
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  // Referência para o estado do jogo que pode ser acessado em event handlers
  const gameStateRef = useRef({
    score,
    lives,
    level,
    isPaused,
  })

  // Atualiza a referência quando o estado muda
  useEffect(() => {
    gameStateRef.current = {
      score,
      lives,
      level,
      isPaused,
    }
  }, [score, lives, level, isPaused])

  // Manipulador de teclas para pausar o jogo
  useEffect(() => {
    // Verificar se estamos no navegador antes de acessar window
    if (typeof window !== "undefined") {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsPaused((prev) => !prev)
        }
      }

      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
    return undefined; // Retorno para ambiente de servidor
  }, [])

  // Função chamada quando o jogo termina
  const handleGameOver = () => {
    setIsGameOver(true)
    // Navega para a tela de game over com a pontuação
    router.push(`/game-over?score=${score}`)
  }

  // Função para atualizar a pontuação
  const updateScore = (newScore: number) => {
    setScore(newScore)
  }

  // Função para atualizar as vidas
  const updateLives = (newLives: number) => {
    setLives(newLives)
    if (newLives <= 0) {
      handleGameOver()
    }
  }

  // Função para atualizar o nível
  const updateLevel = (newLevel: number) => {
    setLevel(newLevel)
  }

  return (
    <div className="game-container">
      {!isGameOver && isBrowser && (
        <DynamicGameSketch
          updateScore={updateScore}
          updateLives={updateLives}
          updateLevel={updateLevel}
          isPaused={isPaused}
          initialLives={lives}
          initialScore={score}
          initialLevel={level}
          onGameOver={handleGameOver}
        />
      )}

      {!isBrowser && (
        <div className="loading-container">
          <div className="loading-text">Carregando jogo...</div>
        </div>
      )}

      {isPaused && (
        <div className="pause-overlay">
          <div className="pause-menu">
            <h2>Jogo Pausado</h2>
            <button onClick={() => setIsPaused(false)}>Continuar</button>
            <button onClick={() => router.push("/menu")}>Menu Principal</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .game-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          background-color: #000;
        }
        
        .loading-container {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 100%;
          height: 100vh;
          background-color: #000;
          color: white;
          font-size: 24px;
        }
        
        .loading-text {
          padding: 20px;
          background-color: rgba(30, 30, 60, 0.7);
          border-radius: 10px;
        }
        
        .pause-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }
        
        .pause-menu {
          background-color: rgba(30, 30, 60, 0.9);
          padding: 2rem;
          border-radius: 1rem;
          text-align: center;
          color: white;
        }
        
        .pause-menu h2 {
          margin-bottom: 1.5rem;
          font-size: 2rem;
        }
        
        .pause-menu button {
          display: block;
          width: 100%;
          padding: 0.75rem;
          margin-bottom: 1rem;
          background-color: #6c5ce7;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-size: 1rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .pause-menu button:hover {
          background-color: #5649c0;
        }
      `}</style>
    </div>
  )
}
