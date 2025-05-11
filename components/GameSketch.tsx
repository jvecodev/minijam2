"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import Sketch from "react-p5"
import type p5Types from "p5"

// Importações dos novos componentes modularizados
import { Player } from "@/game/entities/Player"
import { ObstacleManager } from "@/game/entities/ObstacleManager"
import { PowerUpManager } from "@/game/entities/PowerUpManager"
import { ProjectileManager } from "@/game/entities/ProjectileManager"
import { CoreProjectileManager } from "@/components/CoreProjectile"
import { Background } from "@/components/Background"
import { Ring } from "@/game/Ring"

// Importação de sistemas e hooks
import { RenderManager } from "@/game/render/RenderManager"
import { ParticleSystem } from "@/game/render/ParticleSystem"
import { CollisionSystem } from "@/game/collision/SpatialGrid"
import { useGameLoop } from "@/hooks/useGameLoop"
import { useCollision } from "@/hooks/useCollision"
import { useSound } from "@/hooks/useSound"
import { checkCollision } from "@/utils/physics"

// Tipos
import { GameState, PlayerControls } from "@/types"

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
    // Componentes principais
    player: null as Player | null,
    obstacleManager: null as ObstacleManager | null,
    powerUpManager: null as PowerUpManager | null,
    projectileManager: null as ProjectileManager | null,
    coreProjectileManager: null as CoreProjectileManager | null,
    background: null as Background | null,
    ring: null as Ring | null,
    
    // Sistemas
    renderManager: null as RenderManager | null,
    particleSystem: null as ParticleSystem | null,
    collisionSystem: null as CollisionSystem | null,
    
    // Estado do jogo
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
    controls: { left: false, right: false, jump: false, shoot: false } as PlayerControls,
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
  
  // Função para lidar com colisões
  const handleCollision = useCallback((entityA: any, entityB: any, type: string) => {
    const game = gameRef.current
    
    if (type === 'player-obstacle') {
      handleObstacleCollision(entityB)
    } else if (type === 'player-powerup') {
      handlePowerUpCollection(entityB)
    } else if (type === 'projectile-core') {
      handleProjectileCoreCollision(entityA, entityB)
    } else if (type === 'core-projectile-player') {
      handleCoreProjectilePlayerCollision()
    }
  }, [])
  
  // Função para lidar com colisões entre projéteis do jogador e o núcleo do planeta
  const handleProjectileCoreCollision = (projectile: any, core: any) => {
    const game = gameRef.current
    if (!game.ring || !projectile || !core) return
    
    // Desativa o projétil
    projectile.active = false
    
    // Registra o acerto no núcleo
    const coreDestroyed = game.ring.hitCore()
    
    if (coreDestroyed) {
      // Núcleo foi destruído!
      game.coresDestroyed++
      
      // Adiciona pontos extras
      const bonusPoints = 500 * game.level
      game.score += bonusPoints
      updateScore(game.score)
      
      // Efeito sonoro
      playSound("explosion")
      
      // Efeito visual com partículas
      if (game.particleSystem) {
        game.particleSystem.createEmitter("core_explosion", {
          position: { x: core.x, y: core.y },
          velocity: { x: 0, y: 0, variation: 2 },
          size: { min: 5, max: 20 },
          color: { r: 255, g: 100, b: 50, variation: 50 },
          alpha: { start: 255, end: 0 },
          life: { min: 0.5, max: 2 },
          rate: 100,
          burstCount: 50,
          shape: "circle"
        })
      }
      
      // Depois de alguns segundos, cria um novo núcleo
      setTimeout(() => {
        if (game.ring) game.ring.resetCore()
      }, 3000)
    } else {
      // Efeito sonoro de acerto
      playSound("hit")
      
      // Efeito visual de acerto
      if (game.particleSystem) {
        game.particleSystem.createEmitter("core_hit", {
          position: { x: core.x, y: core.y },
          velocity: { x: 0, y: 0, variation: 1 },
          size: { min: 2, max: 8 },
          color: { r: 255, g: 150, b: 50, variation: 30 },
          alpha: { start: 200, end: 0 },
          life: { min: 0.3, max: 1 },
          rate: 20,
          burstCount: 10,
          shape: "circle"
        })
      }
    }
  }
  
  // Função para lidar com colisões entre projéteis do núcleo e o jogador
  const handleCoreProjectilePlayerCollision = () => {
    const game = gameRef.current
    if (!game.player) return
    
    // Verifica se o jogador tem escudo
    if (game.player.hasShield) {
      game.player.hasShield = false
      playSound("shieldBreak")
    } else {
      // Caso contrário causa dano ao jogador
      handleDamage()
      // Efeito sonoro especial para projéteis do núcleo
      playSound("damage")
    }
  }
  
  // Função de atualização principal do jogo
  const updateGame = useCallback((deltaTime: number, gameTime: number) => {
    const game = gameRef.current
    const p5 = p5Instance.current

    if (!game.player || !game.obstacleManager || !game.powerUpManager || 
        !game.background || !game.ring || !game.renderManager || 
        !game.particleSystem || !game.collisionSystem || !p5) return

    // Atualiza o tempo do jogo
    game.gameTime = gameTime
    
    // Atualiza os controles baseado nas teclas pressionadas
    game.controls = {
      left: p5.keyIsDown(37) || p5.keyIsDown(65), // Seta esquerda ou A
      right: p5.keyIsDown(39) || p5.keyIsDown(68), // Seta direita ou D
      jump: p5.keyIsDown(32), // Barra de espaço
      shoot: p5.keyIsDown(70) || p5.mouseIsPressed // Tecla F ou clique do mouse
    }

    // Limpa o canvas
    p5.background(0)

    // Atualiza o fundo com paralaxe
    game.background.update(game.gameSpeed)
    
    // Atualiza e desenha o anel de Saturno
    game.ring.update(deltaTime)
    
    // Atualiza e desenha o jogador
    game.player.update(game.controls, deltaTime, game.gameTime)

    // Atualiza a distância percorrida
    game.distance += game.gameSpeed * deltaTime

    // Atualiza a pontuação com base na distância
    const newScore = Math.floor(game.distance * 10)
    if (newScore !== game.score) {
      game.score = newScore
      updateScore(game.score)
    }    // Aumenta o nível a cada 1000 pontos com curva de dificuldade balanceada
    const newLevel = Math.floor(game.score / 1000) + 1
    if (newLevel !== game.level) {
      game.level = newLevel
      updateLevel(game.level)
      
      // Curva de dificuldade suavizada: começa mais lenta e acelera menos entre os primeiros níveis
      // Depois aumenta mais rapidamente nos níveis mais altos, mas com um limite superior
      const baseSpeed = 5;
      const maxLevelBonus = 10; // Limita o bônus máximo de velocidade
      const levelBonus = Math.min((game.level - 1) * 0.4, maxLevelBonus);
      
      // Função logística para criar uma curva S de dificuldade
      const difficultyFactor = 1 / (1 + Math.exp(-0.5 * (game.level - 5)));
      
      // Aplica a velocidade final com um cap
      game.gameSpeed = Math.min(baseSpeed + levelBonus + difficultyFactor * 2, 18);
      
      playSound("levelUp")
    }

    // Gera novos obstáculos com base no tempo e nível atual
    // Balanceado: mais fácil no início, progressivamente mais difícil
    const baseObstacleInterval = 2.2; // Base mais lenta para dar tempo de reação
    const minObstacleInterval = 0.6; // Limita a frequência máxima de obstáculos
    const obstacleInterval = Math.max(baseObstacleInterval - (game.level - 1) * 0.15, minObstacleInterval);
    
    if (game.gameTime - game.lastObstacleTime > obstacleInterval) {
      // Gera um obstáculo em uma posição aleatória do anel
      const obstacleAngle = game.ring.getRandomAngle();
      game.obstacleManager.spawnObstacle(game.level, obstacleAngle);
      game.lastObstacleTime = game.gameTime;
      
      // Adiciona variação nos intervalos para tornar o jogo menos previsível
      game.lastObstacleTime += (Math.random() - 0.5) * 0.3;
    }

    // Gera novos power-ups com base no tempo (menos frequentes que obstáculos)
    // Balanceado: power-ups mais frequentes em níveis mais altos para compensar a dificuldade
    const basePowerUpInterval = 6; // Intervalo base mais longo
    const minPowerUpInterval = 3; // Limita a frequência máxima de power-ups
    const powerUpInterval = Math.max(basePowerUpInterval - (game.level - 1) * 0.2, minPowerUpInterval);
    
    if (game.gameTime - game.lastPowerUpTime > powerUpInterval) {
      const powerUpAngle = game.ring.getRandomAngle();
      game.powerUpManager.spawnPowerUp(powerUpAngle);
      game.lastPowerUpTime = game.gameTime;
      
      // Adiciona variação nos intervalos para tornar o jogo menos previsível
      game.lastPowerUpTime += (Math.random() - 0.5) * 0.5;
    }

    // Atualiza obstáculos
    game.obstacleManager.update(game.gameSpeed, deltaTime)
    
    // Atualiza power-ups
    game.powerUpManager.update(game.gameSpeed, deltaTime)
    
    // Verifica se o jogador está atirando
    if (game.player.isShooting && game.projectileManager) {
      const shootDir = game.player.getShootDirection()
      const targetX = game.centerX
      const targetY = game.centerY
      
      if (game.player.shoot(game.gameTime)) {
        // Cria um novo projétil na posição do jogador direcionado ao centro do planeta
        game.projectileManager.shoot(game.player.x, game.player.y, targetX, targetY, game.gameTime)
        playSound("shoot") // Som de tiro
      }
    }
    
    // Atualiza projéteis
    if (game.projectileManager) {
      game.projectileManager.update(deltaTime)
    }
    
    // Verifica colisões com o sistema de colisão
    const playerHitbox = game.player.getHitbox()
    const obstacles = game.obstacleManager.getObstacles()
    const powerUps = game.powerUpManager.getPowerUps()
    
    // Verifica colisões com obstáculos
    for (const obstacle of obstacles) {
      if (obstacle.active && checkCollision(
        playerHitbox.x, playerHitbox.y, playerHitbox.width, playerHitbox.height,
        obstacle.x, obstacle.y, obstacle.width, obstacle.height
      )) {
        handleObstacleCollision(obstacle)
      }
    }
    
    // Verifica colisões com power-ups
    for (const powerUp of powerUps) {
      if (powerUp.active && checkCollision(
        playerHitbox.x, playerHitbox.y, playerHitbox.width, playerHitbox.height,
        powerUp.x, powerUp.y, powerUp.width, powerUp.height
      )) {
        handlePowerUpCollection(powerUp)
      }
    }
    
    // Verifica colisões com projéteis do jogador e o núcleo
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
            handleProjectileCoreCollision(projectile, corePos)
          }
        }
      }
    }
    
    // Atualiza projéteis do núcleo
    if (game.coreProjectileManager && game.ring) {
      const corePos = game.ring.getCorePosition()
      if (game.player && corePos) {
        game.coreProjectileManager.update(deltaTime, corePos, game.player.x, game.player.y)
        
        // Ajusta a dificuldade com base no nível
        game.coreProjectileManager.adjustDifficulty(game.level)
        
        // Verifica colisões entre projéteis do núcleo e o jogador
        const playerHitbox = game.player.getHitbox()
        const coreProjectiles = game.coreProjectileManager.getProjectiles()
        
        for (const projectile of coreProjectiles) {
          if (!projectile.active) continue
          
          if (checkCollision(
            playerHitbox.x, playerHitbox.y, playerHitbox.width, playerHitbox.height,
            projectile.x - projectile.width/2, projectile.y - projectile.height/2, 
            projectile.width, projectile.height
          )) {
            projectile.active = false
            handleCoreProjectilePlayerCollision()
          }
        }
      }
    }
    
    // Atualiza o sistema de partículas
    if (game.particleSystem) {
      game.particleSystem.update(deltaTime)
    }
    
    // Renderiza todos os objetos através do gerenciador de renderização
    if (game.renderManager) {
      game.renderManager.render()
    }
    
    // Desenha a interface do usuário
    drawHUD(p5)
  }, [updateLives, updateScore, updateLevel, playSound, onGameOver])

  // Inicializa o hook de game loop com a função de atualização
  const { gameTime, resetGameTime } = useGameLoop({ 
    isPaused, 
    gameSpeed: gameRef.current.gameSpeed, 
    onUpdate: updateGame
  })
  
  // Referência para a instância de p5
  const p5Instance = useRef<p5Types | null>(null)

  // Setup do P5.js
  const setup = (p5: p5Types, canvasParentRef: Element): void => {
    // Cria o canvas em tela cheia
    p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef)
    
    // Salva a referência da instância p5
    p5Instance.current = p5

    const game = gameRef.current
    
    // Define o centro da tela
    game.centerX = p5.width / 2
    game.centerY = p5.height / 2
    
    // Inicializa os sistemas
    game.renderManager = new RenderManager(p5)
    game.particleSystem = new ParticleSystem(p5)
    game.collisionSystem = new CollisionSystem(p5.width, p5.height, 100)
    
    // Inicializa o anel de Saturno
    game.ring = new Ring(p5, game.centerX, game.centerY)
    
    // Inicializa os componentes do jogo
    game.background = new Background(p5)
    
    // Cria o jogador e configura para usar o anel
    game.player = new Player(p5, p5.width * 0.5, p5.height * 0.5)
    if (game.player && game.ring) {
      game.player.setRing(game.ring)
    }
    
    // Inicializa gerenciadores de obstáculos e power-ups
    const ringWidth = game.ring.getRingWidth()
    game.obstacleManager = new ObstacleManager(p5, game.centerX, ringWidth)
    game.powerUpManager = new PowerUpManager(p5, game.centerX, ringWidth)
    
    // Configura managers para usar o anel
    if (game.ring) {
      game.obstacleManager.setRing(game.ring)
      game.powerUpManager.setRing(game.ring)
    }
    
    // Inicializa o gerenciador de projéteis
    game.projectileManager = new ProjectileManager(p5)
    
    // Inicializa o gerenciador de projéteis do núcleo
    game.coreProjectileManager = new CoreProjectileManager(p5)    // Configura a velocidade inicial do jogo com o novo sistema de balanceamento
    const baseSpeed = 5;
    const maxLevelBonus = 10;
    const levelBonus = Math.min((game.level - 1) * 0.4, maxLevelBonus);
    const difficultyFactor = 1 / (1 + Math.exp(-0.5 * (game.level - 5)));
    game.gameSpeed = Math.min(baseSpeed + levelBonus + difficultyFactor * 2, 18);
    
    // Pré-carrega e inicia o sistema de partículas
    initializeParticleSystems(p5)
    
    // Adiciona os objetos renderizáveis ao gerenciador de renderização
    if (game.renderManager) {
      game.renderManager.addToLayer("background", game.background)
      game.renderManager.addToLayer("ring", game.ring)
      game.renderManager.addToLayer("player", game.player)
      
      if (game.particleSystem) {
        game.renderManager.addToLayer("particles_back", game.particleSystem)
      }
    }
  }

  // Inicializa os sistemas de partículas
  const initializeParticleSystems = (p5: p5Types) => {
    const game = gameRef.current
    if (!game.particleSystem) return
    
    // Configura emissor de partículas para o planeta
    game.particleSystem.createEmitter("planet_aura", {
      position: { x: game.centerX, y: game.centerY },
      velocity: { x: 0, y: 0, variation: 0.5 },
      size: { min: 2, max: 5 },
      color: { r: 100, g: 150, b: 255, variation: 30 },
      alpha: { start: 150, end: 0 },
      life: { min: 1, max: 3 },
      rate: 8,
      shape: "circle"
    })
    
    // Configura emissor para a trilha do jogador
    if (game.player) {
      game.particleSystem.createEmitter("player_trail", {
        position: { x: game.player.x, y: game.player.y },
        velocity: { x: 0, y: 0, variation: 0.5 },
        size: { min: 3, max: 8 },
        color: { r: 50, g: 150, b: 200, variation: 20 },
        alpha: { start: 150, end: 0 },
        life: { min: 0.5, max: 1.2 },
        rate: 12,
        shape: "circle"
      })
    }
  }

  // Função de desenho principal
  const draw = (p5: p5Types): void => {
    // A lógica de desenho é gerenciada pelo RenderManager
    // Este método está aqui principalmente para atender ao contrato do P5.js
    // A maior parte da lógica de atualização está na função updateGame
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
  // Função para salvar a pontuação e mostrar a tela de game over
  const saveScoreAndEndGame = () => {
    const game = gameRef.current;
    
    // Importa dinamicamente o sistema de high scores
    import('../utils/highscores').then(({ addHighScore }) => {
      const isNewHighScore = addHighScore(game.score, game.level);
      game.isNewHighScore = isNewHighScore;
      
      setTimeout(() => onGameOver(), 1000);
    }).catch(err => {
      console.error("Erro ao salvar pontuação:", err);
      setTimeout(() => onGameOver(), 1000);
    });
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
    p5.text(`Núcleos Destruídos: ${game.coresDestroyed}`, 20, 110)

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
