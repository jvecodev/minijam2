"use client"

import { useRef, useEffect } from "react"
import Sketch from "react-p5"
import type p5Types from "p5"
import { Player } from "@/components/Player"
import { ObstacleManager } from "@/components/Obstacle"
import { PowerUpManager } from "@/components/PowerUp"
import { Background } from "@/components/Background"
import { checkCollision } from "@/utils/physics"
import { useSound } from "@/hooks/useSound"

interface GameSketchProps {
  updateScore: (score: number) => void
  updateLives: (lives: number) => void
  updateLevel: (level: number) => void
  isPaused: boolean
  initialLives: number
  initialScore: number
  initialLevel: number
  onGameOver: () => void
}

export default function GameSketch({
  updateScore,
  updateLives,
  updateLevel,
  isPaused,
  initialLives,
  initialScore,
  initialLevel,
  onGameOver,
}: GameSketchProps) {
  // Referência para o estado do jogo
  const gameRef = useRef({
    player: null as Player | null,
    obstacleManager: null as ObstacleManager | null,
    powerUpManager: null as PowerUpManager | null,
    background: null as Background | null,
    score: initialScore,
    lives: initialLives,
    level: initialLevel,
    distance: 0, // Distância percorrida (para pontuação e dificuldade)
    gameSpeed: 5, // Velocidade base do jogo
    groundY: 0, // Posição Y do chão (anel)
    groundHeight: 0, // Altura do anel
    groundCurve: 0, // Curvatura do anel
    lastObstacleTime: 0, // Tempo desde o último obstáculo
    lastPowerUpTime: 0, // Tempo desde o último power-up
    gameTime: 0, // Tempo total de jogo
    isGameOver: false,
  })

  // Carregar o volume das opções
  const volume = useRef(0.5)
  useEffect(() => {
    // Verificar se estamos no navegador antes de acessar localStorage
    if (typeof window !== "undefined") {
      const savedVolume = localStorage.getItem("saturnRunnerVolume")
      if (savedVolume) {
        volume.current = Number.parseFloat(savedVolume)
      }
    }
  }, [])

  // Hook de som
  const { playSound } = useSound(volume.current)

  // Setup do P5.js
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    // Cria o canvas em tela cheia
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef)

    const game = gameRef.current

    // Define as dimensões do jogo
    game.groundY = p5.height * 0.7 // Posição Y do anel (70% da altura da tela)
    game.groundHeight = p5.height * 0.05 // Altura do anel (5% da altura da tela)
    game.groundCurve = p5.height * 0.05 // Curvatura do anel

    // Inicializa os componentes do jogo
    game.background = new Background(p5)
    game.player = new Player(p5, p5.width * 0.2, game.groundY - game.groundHeight / 2)
    game.obstacleManager = new ObstacleManager(p5, game.groundY, game.groundHeight)
    game.powerUpManager = new PowerUpManager(p5, game.groundY, game.groundHeight)

    // Configura a velocidade inicial do jogo
    game.gameSpeed = 5 + (game.level - 1) * 0.5
  }

  // Função de desenho principal (loop do jogo)
  const draw = (p5: p5Types) => {
    if (isPaused) return

    const game = gameRef.current
    if (!game.player || !game.obstacleManager || !game.powerUpManager || !game.background) return

    // Atualiza o tempo do jogo
    const deltaTime = p5.deltaTime / 1000 // Converte para segundos
    game.gameTime += deltaTime

    // Limpa o canvas
    p5.background(0)

    // Desenha o fundo com paralaxe
    game.background.update(game.gameSpeed)
    game.background.draw()

    // Desenha o anel de Saturno (chão)
    drawGround(p5)

    // Atualiza e desenha o jogador
    game.player.update(p5.keyIsDown(32), deltaTime, game.groundY - game.groundHeight / 2)
    game.player.draw()

    // Atualiza a distância percorrida
    game.distance += game.gameSpeed * deltaTime

    // Atualiza a pontuação com base na distância
    const newScore = Math.floor(game.distance * 10)
    if (newScore !== game.score) {
      game.score = newScore
      updateScore(game.score)
    }

    // Aumenta o nível a cada 1000 pontos
    const newLevel = Math.floor(game.score / 1000) + 1
    if (newLevel !== game.level) {
      game.level = newLevel
      updateLevel(game.level)
      game.gameSpeed = 5 + (game.level - 1) * 0.5 // Aumenta a velocidade com o nível
      playSound("levelUp")
    }

    // Gera novos obstáculos com base no tempo
    if (game.gameTime - game.lastObstacleTime > 2 / game.level) {
      game.obstacleManager.spawnObstacle(game.level)
      game.lastObstacleTime = game.gameTime
    }

    // Gera novos power-ups com base no tempo (menos frequentes que obstáculos)
    if (game.gameTime - game.lastPowerUpTime > 5 / game.level) {
      game.powerUpManager.spawnPowerUp()
      game.lastPowerUpTime = game.gameTime
    }

    // Atualiza e desenha obstáculos
    game.obstacleManager.update(game.gameSpeed, deltaTime)
    game.obstacleManager.draw()

    // Atualiza e desenha power-ups
    game.powerUpManager.update(game.gameSpeed, deltaTime)
    game.powerUpManager.draw()

    // Verifica colisões com obstáculos
    const playerHitbox = game.player.getHitbox()
    const obstacles = game.obstacleManager.getObstacles()

    for (const obstacle of obstacles) {
      if (
        obstacle.active &&
        checkCollision(
          playerHitbox.x,
          playerHitbox.y,
          playerHitbox.width,
          playerHitbox.height,
          obstacle.x,
          obstacle.y,
          obstacle.width,
          obstacle.height,
        )
      ) {
        handleObstacleCollision(obstacle)
      }
    }

    // Verifica coleta de power-ups
    const powerUps = game.powerUpManager.getPowerUps()

    for (const powerUp of powerUps) {
      if (
        powerUp.active &&
        checkCollision(
          playerHitbox.x,
          playerHitbox.y,
          playerHitbox.width,
          playerHitbox.height,
          powerUp.x,
          powerUp.y,
          powerUp.width,
          powerUp.height,
        )
      ) {
        handlePowerUpCollection(powerUp)
      }
    }

    // Desenha a interface do usuário
    drawHUD(p5)
  }

  // Função para desenhar o anel de Saturno (chão)
  const drawGround = (p5: p5Types) => {
    const game = gameRef.current

    p5.push()

    // Desenha Saturno à esquerda
    p5.fill(230, 200, 160)
    p5.noStroke()
    p5.ellipse(p5.width * 0.05, p5.height * 0.5, p5.height * 0.6, p5.height * 0.6)

    // Desenha sombra em Saturno
    p5.fill(180, 150, 100, 100)
    p5.arc(p5.width * 0.05, p5.height * 0.5, p5.height * 0.6, p5.height * 0.6, -p5.PI / 2, p5.PI / 2)

    // Desenha o anel com curvatura
    p5.noFill()
    p5.stroke(220, 200, 150)
    p5.strokeWeight(game.groundHeight)

    // Desenha uma curva suave para o anel
    p5.beginShape()
    for (let x = 0; x < p5.width; x += 20) {
      // Calcula a altura do anel com uma leve curvatura
      const yOffset = Math.sin((x / p5.width) * p5.PI) * game.groundCurve
      p5.vertex(x, game.groundY + yOffset)
    }
    p5.endShape()

    // Adiciona detalhes ao anel
    p5.strokeWeight(1)
    p5.stroke(255, 255, 255, 100)

    for (let i = -2; i <= 2; i++) {
      p5.beginShape()
      for (let x = 0; x < p5.width; x += 20) {
        const yOffset = Math.sin((x / p5.width) * p5.PI) * game.groundCurve
        p5.vertex(x, game.groundY + yOffset + i * (game.groundHeight / 5))
      }
      p5.endShape()
    }

    p5.pop()
  }

  // Função para desenhar a interface do usuário (HUD)
  const drawHUD = (p5: p5Types) => {
    const game = gameRef.current

    p5.push()
    p5.fill(255)
    p5.textSize(20)
    p5.textAlign(p5.LEFT, p5.TOP)

    // Pontuação
    p5.text(`Pontuação: ${game.score}`, 20, 20)

    // Nível
    p5.text(`Nível: ${game.level}`, 20, 50)

    // Vidas
    p5.text("Vidas:", 20, 80)
    for (let i = 0; i < game.lives; i++) {
      p5.fill(255, 50, 50)
      p5.ellipse(100 + i * 30, 90, 20, 20)
    }

    // Power-up ativo
    if (game.player?.hasShield) {
      p5.fill(0, 200, 255)
      p5.text("Escudo Ativo", 20, 120)
    }

    if (game.player?.hasSpeedBoost) {
      p5.fill(255, 200, 0)
      p5.text("Impulso Ativo", 20, 150)
    }

    p5.pop()
  }

  // Manipula colisão com obstáculos
  const handleObstacleCollision = (obstacle: any) => {
    const game = gameRef.current
    if (!game.player) return

    // Marca o obstáculo como inativo
    obstacle.active = false

    // Se tem escudo, apenas remove o escudo
    if (game.player.hasShield) {
      game.player.hasShield = false
      playSound("shield")
      return
    }

    // Reduz uma vida
    game.lives--
    updateLives(game.lives)

    // Efeito visual de dano
    game.player.showDamageEffect()
    playSound("hit")

    // Verifica game over
    if (game.lives <= 0) {
      game.isGameOver = true
      playSound("gameOver")
      onGameOver()
    }
  }

  // Manipula coleta de power-ups
  const handlePowerUpCollection = (powerUp: any) => {
    const game = gameRef.current
    if (!game.player) return

    // Marca o power-up como inativo
    powerUp.active = false

    switch (powerUp.type) {
      case "crystal":
        // Adiciona pontos
        game.score += 50
        updateScore(game.score)
        playSound("crystal")
        break

      case "shield":
        // Ativa escudo
        game.player.hasShield = true
        playSound("shield")
        setTimeout(() => {
          if (game.player) {
            game.player.hasShield = false
          }
        }, 5000)
        break

      case "speedBoost":
        // Ativa impulso de velocidade
        game.player.hasSpeedBoost = true
        playSound("boost")

        // Efeito temporário de aumento de velocidade
        const originalSpeed = game.gameSpeed
        game.gameSpeed *= 1.5

        setTimeout(() => {
          if (game.player) {
            game.player.hasSpeedBoost = false
            game.gameSpeed = originalSpeed
          }
        }, 3000)
        break
    }
  }

  // Manipulador de redimensionamento da janela
  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)

    const game = gameRef.current

    // Recalcula as dimensões
    game.groundY = p5.height * 0.7
    game.groundHeight = p5.height * 0.05
    game.groundCurve = p5.height * 0.05

    // Atualiza as posições dos componentes
    if (game.player) {
      game.player.setPosition(p5.width * 0.2, game.groundY - game.groundHeight / 2)
    }

    if (game.obstacleManager) {
      game.obstacleManager.updateDimensions(game.groundY, game.groundHeight)
    }

    if (game.powerUpManager) {
      game.powerUpManager.updateDimensions(game.groundY, game.groundHeight)
    }
  }

  // Manipulador de teclas
  const keyPressed = (p5: p5Types) => {
    // Espaço para pular
    if (p5.keyCode === 32) {
      const game = gameRef.current
      if (game.player && !game.player.isJumping) {
        game.player.jump()
        playSound("jump")
      }
    }
  }

  // Manipulador de toque (para dispositivos móveis)
  const touchStarted = (p5: p5Types) => {
    const game = gameRef.current
    if (game.player && !game.player.isJumping) {
      game.player.jump()
      playSound("jump")
    }
    return false // Previne comportamento padrão
  }

  return (
    <Sketch
      setup={setup}
      draw={draw}
      windowResized={windowResized}
      keyPressed={keyPressed}
      touchStarted={touchStarted}
    />
  )
}
