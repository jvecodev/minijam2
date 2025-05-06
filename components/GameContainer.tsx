"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import MainMenu from "./MainMenu"
import GameOverScreen from "./GameOverScreen"
import HowToPlay from "./HowToPlay"
import Options from "./Options"

// Import P5 component with no SSR to avoid hydration issues
const GameSketch = dynamic(() => import("./GameSketch"), {
  ssr: false,
})

export type GameState = "menu" | "playing" | "gameOver" | "howToPlay" | "options"

export default function GameContainer() {
  const [gameState, setGameState] = useState<GameState>("menu")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [volume, setVolume] = useState(0.5)

  const handleGameOver = (finalScore: number) => {
    if (finalScore > highScore) {
      setHighScore(finalScore)
    }
    setGameState("gameOver")
  }

  const startGame = () => {
    setScore(0)
    setLevel(1)
    setGameState("playing")
  }

  const renderContent = () => {
    switch (gameState) {
      case "menu":
        return (
          <MainMenu
            onStart={startGame}
            onHowToPlay={() => setGameState("howToPlay")}
            onOptions={() => setGameState("options")}
          />
        )
      case "playing":
        return (
          <GameSketch
            onGameOver={handleGameOver}
            setScore={setScore}
            setLevel={setLevel}
            score={score}
            level={level}
            volume={volume}
          />
        )
      case "gameOver":
        return (
          <GameOverScreen
            score={score}
            highScore={highScore}
            onRestart={startGame}
            onMenu={() => setGameState("menu")}
          />
        )
      case "howToPlay":
        return <HowToPlay onBack={() => setGameState("menu")} />
      case "options":
        return <Options volume={volume} setVolume={setVolume} onBack={() => setGameState("menu")} />
    }
  }

  return (
    <div className="w-full max-w-4xl aspect-video bg-gray-900 relative overflow-hidden rounded-lg shadow-2xl border border-purple-500">
      {renderContent()}
    </div>
  )
}
