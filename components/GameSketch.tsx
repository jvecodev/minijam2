"use client"

import { useRef, useEffect } from "react"
import Sketch from "react-p5"
import type p5Types from "p5"
import { Player } from "@/components/Player"
import { ObstacleManager } from "@/components/Obstacle"
import { PowerUpManager } from "@/components/PowerUp"
import { ProjectileManager } from "@/components/Projectile"
import { CoreProjectileManager } from "@/components/CoreProjectile"
import { Background } from "@/components/Background"
import { Ring } from "@/game/Ring"
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
  onVictory: (score: number) => void 
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
  onVictory,
}: GameSketchProps) {  // Referência para o estado do jogo
  const gameRef = useRef({
    player: null as Player | null,
    obstacleManager: null as ObstacleManager | null,
    powerUpManager: null as PowerUpManager | null,
    projectileManager: null as ProjectileManager | null,
    coreProjectileManager: null as CoreProjectileManager | null,
    background: null as Background | null,
    ring: null as Ring | null,
    score: initialScore,
    lives: initialLives,
    level: initialLevel,
    distance: 0, 
    gameSpeed: 5,
    centerX: 0, 
    centerY: 0, 
    lastObstacleTime: 0,
    lastPowerUpTime: 0, 
    gameTime: 0, 
    isGameOver: false,
    coresDestroyed: 0, 
    coresNeededForVictory: 3, // Número de núcleos que precisam ser destruídos para vencer
    hasWon: false, // Novo estado para controlar se o jogador venceu
    controls: { left: false, right: false, jump: false, shoot: false },
  })

 
  const volume = useRef(0.5)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedVolume = localStorage.getItem("saturnRunnerVolume")
      if (savedVolume) {
        volume.current = Number.parseFloat(savedVolume)
      }
    }
  }, [])

  const { playSound } = useSound(volume.current)
  const setup = (p5: p5Types, canvasParentRef: Element): void => {
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef)

    const game = gameRef.current
    
   
    game.centerX = p5.width / 2
    game.centerY = p5.height / 2
    
    game.ring = new Ring(p5, game.centerX, game.centerY)
    game.background = new Background(p5)
    
    game.player = new Player(p5, p5.width * 0.5, p5.height * 0.5)
    if (game.player && game.ring) {
      game.player.setRing(game.ring)
    }
    
    const ringWidth = game.ring.getRingWidth()

    game.obstacleManager = new ObstacleManager(p5, game.centerX, ringWidth)
    game.powerUpManager = new PowerUpManager(p5, game.centerX, ringWidth)
    
    game.projectileManager = new ProjectileManager(p5)
    
    game.coreProjectileManager = new CoreProjectileManager(p5)

    game.gameSpeed = 5 + (game.level - 1) * 0.5
  }
  const draw = (p5: p5Types): void => {
    if (isPaused) return

    const game = gameRef.current
    if (!game.player || !game.obstacleManager || !game.powerUpManager || !game.background || !game.ring) return

    const deltaTime = p5.deltaTime / 1000 
    game.gameTime += deltaTime    
    game.controls = {
      left: p5.keyIsDown(37) || p5.keyIsDown(65), 
      right: p5.keyIsDown(39) || p5.keyIsDown(68), 
      jump: p5.keyIsDown(32), 
      shoot: p5.keyIsDown(70) || p5.mouseIsPressed 
    }

    p5.background(0)

    game.background.update(game.gameSpeed)
    game.background.draw()
    
    game.ring.update(deltaTime)
    game.ring.draw()    
    game.player.update(game.controls, deltaTime, game.gameTime)
    game.player.draw()

   
    game.distance += game.gameSpeed * deltaTime

    const newScore = Math.floor(game.distance * 10)
    if (newScore !== game.score) {
      game.score = newScore
      updateScore(game.score)
    }

   
    const newLevel = Math.floor(game.score / 1000) + 1
    if (newLevel !== game.level) {
      game.level = newLevel
      updateLevel(game.level)
      game.gameSpeed = 5 + (game.level - 1) * 0.5 
      playSound("levelUp")
    }

    if (game.gameTime - game.lastObstacleTime > 2 / game.level) {
     
      const obstacleAngle = game.ring.getRandomAngle()
      game.obstacleManager.spawnObstacle(game.level, obstacleAngle)
      game.lastObstacleTime = game.gameTime
    }

    if (game.gameTime - game.lastPowerUpTime > 5 / game.level) {
      const powerUpAngle = game.ring.getRandomAngle()
      game.powerUpManager.spawnPowerUp(powerUpAngle)
      game.lastPowerUpTime = game.gameTime
    }

    game.obstacleManager.update(game.gameSpeed, deltaTime)
    game.obstacleManager.draw()   
    game.powerUpManager.update(game.gameSpeed, deltaTime)
    game.powerUpManager.draw()
    

    if (game.player.isShooting && game.projectileManager) {
      const shootDir = game.player.getShootDirection()
      const targetX = game.centerX
      const targetY = game.centerY
      
      if (game.player.shoot(game.gameTime)) {
        game.projectileManager.shoot(game.player.x, game.player.y, targetX, targetY, game.gameTime)
        playSound("shoot") 
      }
    }
    
    if (game.projectileManager) {
      game.projectileManager.update(deltaTime)
      game.projectileManager.draw()
    }
    
   
    if (game.ring && game.projectileManager) {
      const corePos = game.ring.getCorePosition()
      if (corePos && corePos.active) {
        const projectiles = game.projectileManager.getProjectiles()
        
        for (const projectile of projectiles) {
          if (!projectile.active) continue
          
         
          const dx = projectile.x - corePos.x
          const dy = projectile.y - corePos.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance < corePos.radius + projectile.width/2) {
            projectile.active = false
            
            const coreDestroyed = game.ring.hitCore()
            
            if (coreDestroyed) {
              game.coresDestroyed++
              
              const bonusPoints = 500 * game.level
              game.score += bonusPoints
              updateScore(game.score)
              
              
              playSound("explosion")
              
              if (game.coresDestroyed >= game.coresNeededForVictory && !game.hasWon) {
                game.hasWon = true;
                setTimeout(() => {
                  onVictory(game.score);
                }, 2000);
              } else {
                setTimeout(() => {
                  if (game.ring) game.ring.resetCore()
                }, 3000)
              }
            } else {
              playSound("hit")
            }
          }
        }
      }
    }

    if (game.coreProjectileManager && game.ring) {
      const corePos = game.ring.getCorePosition()
      if (game.player) {
        game.coreProjectileManager.update(deltaTime, corePos, game.player.x, game.player.y)
        game.coreProjectileManager.draw()
        
 
        game.coreProjectileManager.adjustDifficulty(game.level)
  
        const playerHitbox = game.player.getHitbox()
        const coreProjectiles = game.coreProjectileManager.getProjectiles()
        
        for (const projectile of coreProjectiles) {
          if (!projectile.active) continue
          
          if (checkCollision(
            playerHitbox.x,
            playerHitbox.y,
            playerHitbox.width,
            playerHitbox.height,
            projectile.x - projectile.width/2,
            projectile.y - projectile.height/2,
            projectile.width,
            projectile.height
          )) {
            projectile.active = false
            
            if (game.player.hasShield) {
              game.player.hasShield = false
              game.player.showDamageEffect()
              playSound("shieldBreak")
            } else {
              handleDamage()
              playSound("damage")
            }
          }
        }
      }
    }

  
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

  // Função para lidar com colisões com obstáculos
  const handleObstacleCollision = (obstacle: any) => {
    const game = gameRef.current
    if (!game.player) return

    // Desativa o obstáculo
    obstacle.active = false

    // Verifica se o jogador tem escudo
    if (game.player.hasShield) {
      game.player.hasShield = false
      playSound("shieldBreak")
      return
    }

    // Reduz vidas e atualiza a interface
    game.lives -= 1
    updateLives(game.lives)

    // Mostra efeito de dano
    game.player.showDamageEffect()
    playSound("damage")

    // Verifica game over
    if (game.lives <= 0 && !game.isGameOver) {
      game.isGameOver = true
      playSound("gameOver")
      setTimeout(() => onGameOver(), 1000)
    }
  }

  // Função para lidar com a coleta de power-ups
  const handlePowerUpCollection = (powerUp: any) => {
    const game = gameRef.current
    if (!game.player) return

    // Desativa o power-up
    powerUp.active = false

    // Efeito com base no tipo de power-up
    switch (powerUp.type) {
      case "shield":
        game.player.hasShield = true
        playSound("powerUp")
        break
      case "speed":
        game.player.hasSpeedBoost = true
        setTimeout(() => {
          if (game.player) game.player.hasSpeedBoost = false
        }, 5000) // Dura 5 segundos
        playSound("powerUp")
        break
      case "life":
        if (game.lives < 5) {
          // Limita a 5 vidas
          game.lives += 1
          updateLives(game.lives)
          playSound("extraLife")
        }
        break
    }
  }

  // Função para desenhar a interface do usuário (HUD)
  const drawHUD = (p5: p5Types) => {
    const game = gameRef.current

    // Fonte e estilo
    p5.textSize(20)
    p5.textAlign(p5.LEFT, p5.TOP)
    p5.fill(255)
    p5.noStroke()

    // Exibe pontuação
    p5.text(`Pontuação: ${game.score}`, 20, 20)

    // Exibe nível
    p5.text(`Nível: ${game.level}`, 20, 50)

  // Exibe vidas
    p5.text("Vidas:", 20, 80)
    for (let i = 0; i < game.lives; i++) {
      p5.fill(255, 0, 0)
      p5.ellipse(100 + i * 30, 90, 20, 20)
    }
    
    // Exibe número de núcleos destruídos
    p5.fill(255, 150, 0)
    p5.text(`Núcleos Destruídos: ${game.coresDestroyed}/${game.coresNeededForVictory}`, 20, 110)

    // Exibe estado dos power-ups
    if (game.player) {
      if (game.player.hasShield) {
        p5.fill(0, 200, 255)
        p5.text("Escudo Ativo!", 20, 120)
      }

      if (game.player.hasSpeedBoost) {
        p5.fill(255, 200, 0)
        p5.text("Velocidade Aumentada!", 20, 150)
      }
    }
  }

  // Função para lidar com dano recebido de projéteis do núcleo
  const handleDamage = () => {
    const game = gameRef.current
    if (!game.player) return
    
    // Reduz vidas e atualiza a interface
    game.lives -= 1
    updateLives(game.lives)

    // Mostra efeito de dano
    game.player.showDamageEffect()
    playSound("damage")

    // Verifica game over
    if (game.lives <= 0 && !game.isGameOver) {
      game.isGameOver = true
      playSound("gameOver")
      setTimeout(() => onGameOver(), 1000)
    }
  }

  // Função para redimensionar o canvas quando a janela é redimensionada
  const windowResized = (p5: p5Types) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight)

    const game = gameRef.current
    
    // Atualiza o centro
    game.centerX = p5.width / 2
    game.centerY = p5.height / 2
    
    // Recria o anel com as novas dimensões
    if (game.ring) {
      game.ring = new Ring(p5, game.centerX, game.centerY)
      
      // Reconecta o jogador ao novo anel
      if (game.player) {
        game.player.setRing(game.ring)
      }
    }
  }

  return (
    <Sketch setup={setup} draw={draw} windowResized={windowResized} className="game-canvas" />
  )
}
