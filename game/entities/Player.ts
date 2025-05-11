import type p5Types from "p5"
import { Ring } from "@/game/Ring"
import { PlayerControls, Position, Dimensions } from "@/types"

export class Player implements Position, Dimensions {
  p5: p5Types
  x: number
  y: number
  width: number
  height: number
  velocityY: number
  gravity: number
  jumpForce: number
  isJumping: boolean
  isRunning: boolean
  hasShield: boolean
  hasSpeedBoost: boolean
  damageEffect: number
  animationFrame: number
  animationTimer: number
  groundY: number
  angle: number
  ring: Ring | null
  moveSpeed: number
  jumpHeight: number
  jumpDistance: number
  rotation: number
  isShooting: boolean
  shootCooldown: number
  lastShootTime: number

  constructor(p5: p5Types, x: number, y: number) {
    this.p5 = p5
    this.x = x
    this.y = y
    this.width = 40
    this.height = 60
    this.velocityY = 0
    this.gravity = 30
    this.jumpForce = -15
    this.isJumping = false
    this.isRunning = true
    this.hasShield = false
    this.hasSpeedBoost = false
    this.damageEffect = 0
    this.animationFrame = 0
    this.animationTimer = 0
    this.groundY = y
    
    // Propriedades para o movimento orbital
    this.angle = Math.PI; // Começa na parte inferior do anel
    this.ring = null
    this.moveSpeed = 0.05
    this.jumpHeight = 0
    this.jumpDistance = 0
    this.rotation = 0
    
    // Atributos para o sistema de tiro
    this.isShooting = false
    this.shootCooldown = 0.5 // Tempo em segundos entre tiros
    this.lastShootTime = 0
  }

  setRing(ring: Ring): void {
    this.ring = ring
    this.angle = Math.PI // Começa na parte inferior do anel
    const pos = ring.getPointOnRing(this.angle)
    this.x = pos.x
    this.y = pos.y
  }
  
  update(controls: PlayerControls, deltaTime: number, gameTime: number): void {
    if (!this.ring) return;
    
    // Atualiza o timer de animação com velocidade variável baseada na velocidade
    const animSpeed = this.hasSpeedBoost ? 0.05 : 0.08;
    this.animationTimer += deltaTime * (1 + (this.isRunning ? 0.5 : 0))
    if (this.animationTimer >= animSpeed) {
      // Muda o frame com velocidade adaptativa
      this.animationFrame = (this.animationFrame + 1) % 8 // Aumenta o número de frames para animação mais suave
      this.animationTimer = 0
    }
    
    // Movimento orbital
    let direction = 0
    if (controls.left) direction -= 1
    if (controls.right) direction += 1
    
    // Aplica o movimento ao longo do anel
    if (direction !== 0) {
      const moveSpeed = this.hasSpeedBoost ? this.moveSpeed * 1.5 : this.moveSpeed
      this.angle = this.ring.movePlayer(this.angle, direction, moveSpeed * deltaTime * 60)
    }
    
    // Verifica se o jogador está atirando
    this.isShooting = controls.shoot && (gameTime - this.lastShootTime > this.shootCooldown)
    
    // Lida com o pulo
    if (controls.jump && !this.isJumping) {
      this.isJumping = true
      this.jumpHeight = 0
      this.velocityY = this.jumpForce
    }
    
    // Se estiver pulando, aplica física vertical
    if (this.isJumping) {
      // Aplica gravidade
      this.velocityY += this.gravity * deltaTime
      
      // Atualiza posição vertical (simulando pulo para fora do anel)
      this.jumpHeight += this.velocityY * deltaTime
      
      // Define o ângulo de pulo com base na direção do movimento
      this.jumpDistance += direction * this.moveSpeed * deltaTime * 30
      
      // Calcula a posição atual como posição base do anel + deslocamento do pulo
      if (this.ring) {
        const basePos = this.ring.getPointOnRing(this.angle)
        
        // Calcula vetor do centro para o ponto no anel (direção para fora do anel)
        const dirX = basePos.x - this.ring.centerX
        const dirY = basePos.y - this.ring.centerY
        
        // Normaliza o vetor
        const length = Math.sqrt(dirX * dirX + dirY * dirY)
        const normDirX = dirX / length
        const normDirY = dirY / length
        
        // Posição = posição no anel + deslocamento na direção normal ao anel
        this.x = basePos.x + normDirX * this.jumpHeight
        this.y = basePos.y + normDirY * this.jumpHeight
        
        // Atualiza a rotação do jogador para acompanhar o pulo
        const targetRotation = Math.atan2(normDirY, normDirX) + Math.PI/2
        this.rotation = targetRotation
        
        // Verifica se o jogador voltou ao anel
        if (this.jumpHeight > 0) {
          this.isJumping = false
          this.jumpHeight = 0
          this.velocityY = 0
          
          // Retorna à posição no anel
          this.x = basePos.x
          this.y = basePos.y
        }
      }
    } else {
      // Não está pulando, simplesmente atualiza a posição no anel
      if (this.ring) {
        const pos = this.ring.getPointOnRing(this.angle)
        this.x = pos.x
        this.y = pos.y
        
        // Calcula a rotação para acompanhar o anel
        const angleToCenter = Math.atan2(this.y - this.ring.centerY, this.x - this.ring.centerX)
        this.rotation = angleToCenter + Math.PI/2
      }
    }
    
    // Reduz o efeito de dano ao longo do tempo
    if (this.damageEffect > 0) {
      this.damageEffect -= deltaTime * 2
      if (this.damageEffect < 0) this.damageEffect = 0
    }
    
    // Decaimento natural de power-ups
    if (this.hasShield) {
      this.shieldTimer -= deltaTime
      if (this.shieldTimer <= 0) {
        this.hasShield = false
      }
    }
    
    if (this.hasSpeedBoost) {
      this.speedTimer -= deltaTime
      if (this.speedTimer <= 0) {
        this.hasSpeedBoost = false
      }
    }
  }

  draw(): void {
    this.p5.push()
    this.p5.translate(this.x, this.y)
    this.p5.rotate(this.rotation)
    
    // Tamanho base do jogador
    const baseWidth = this.width
    const baseHeight = this.height
    
    // Efeito de pulsação quando tem power-up
    const scaleEffect = 1 + (this.hasShield || this.hasSpeedBoost ? Math.sin(this.p5.millis() * 0.01) * 0.1 : 0)
    
    // Aplica efeito visual para dano (pulsação vermelha)
    if (this.damageEffect > 0) {
      const pulseSize = 1 + Math.sin(this.p5.millis() * 0.02) * 0.2
      this.p5.fill(255, 0, 0, this.damageEffect * 100)
      this.p5.noStroke()
      this.p5.ellipse(0, 0, baseWidth * 2 * pulseSize, baseHeight * 2 * pulseSize)
    }
    
    // Efeito de escudo
    if (this.hasShield) {
      const shieldPulse = 1 + Math.sin(this.p5.millis() * 0.003) * 0.1
      this.p5.noFill()
      this.p5.stroke(0, 100, 255, 150 + Math.sin(this.p5.millis() * 0.01) * 50)
      this.p5.strokeWeight(3)
      this.p5.ellipse(0, 0, baseWidth * 1.8 * shieldPulse, baseHeight * 1.8 * shieldPulse)
      
      // Efeito de energia no escudo
      const shieldRotation = this.p5.millis() * 0.001
      for (let i = 0; i < 8; i++) {
        const angle = shieldRotation + (i / 8) * this.p5.TWO_PI
        const x = Math.cos(angle) * baseWidth * 0.9
        const y = Math.sin(angle) * baseHeight * 0.9
        const size = 3 + Math.sin(this.p5.millis() * 0.01 + i) * 2
        
        this.p5.fill(100, 200, 255, 200)
        this.p5.noStroke()
        this.p5.ellipse(x, y, size, size)
      }
    }
    
    // Efeito de velocidade
    if (this.hasSpeedBoost) {
      // Rastro de velocidade
      const speedColor = this.p5.color(255, 200, 0, 100)
      this.p5.noStroke()
      this.p5.fill(speedColor)
      
      // Múltiplos rastros
      for (let i = 0; i < 5; i++) {
        const offset = -10 - i * 5
        const fadeAlpha = 150 - i * 30
        this.p5.fill(255, 200, 0, fadeAlpha)
        this.p5.ellipse(offset, 0, baseWidth * (1 - i * 0.15), baseHeight * (1 - i * 0.15))
      }
      
      // Linhas de velocidade
      this.p5.stroke(255, 200, 0, 200)
      this.p5.strokeWeight(2)
      for (let i = 0; i < 3; i++) {
        const offset = -15 - i * 10
        const length = 10 + i * 5
        this.p5.line(offset - length, -baseHeight/3, offset, -baseHeight/3)
        this.p5.line(offset - length, 0, offset, 0)
        this.p5.line(offset - length, baseHeight/3, offset, baseHeight/3)
      }
    }
    
    // Desenho do jogador
    this.p5.fill(50, 150, 200)
    this.p5.noStroke()
    
    // Corpo principal
    this.p5.ellipse(0, 0, baseWidth * scaleEffect, baseHeight * scaleEffect)
    
    // Olhos
    this.p5.fill(255)
    this.p5.ellipse(-baseWidth * 0.15, -baseHeight * 0.15, baseWidth * 0.3, baseHeight * 0.3)
    this.p5.ellipse(baseWidth * 0.15, -baseHeight * 0.15, baseWidth * 0.3, baseHeight * 0.3)
    
    // Pupilas (seguem a direção do movimento)
    this.p5.fill(0)
    const eyeDirection = this.isShooting ? 0 : (this.isJumping ? 0.5 : 0.2)  
    this.p5.ellipse(-baseWidth * 0.15 + eyeDirection, -baseHeight * 0.15, baseWidth * 0.15, baseHeight * 0.15)
    this.p5.ellipse(baseWidth * 0.15 + eyeDirection, -baseHeight * 0.15, baseWidth * 0.15, baseHeight * 0.15)
    
    // Boca
    if (this.isShooting) {
      // Boca aberta durante o tiro
      this.p5.fill(100, 50, 50)
      this.p5.ellipse(0, baseHeight * 0.1, baseWidth * 0.4, baseHeight * 0.3)
      this.p5.fill(150, 50, 50)
      this.p5.ellipse(0, baseHeight * 0.15, baseWidth * 0.2, baseHeight * 0.15)
    } else if (this.isJumping) {
      // Boca para pulo
      this.p5.fill(0)
      this.p5.ellipse(0, baseHeight * 0.1, baseWidth * 0.3, baseHeight * 0.15)
    } else {
      // Boca normal com animação
      this.p5.fill(0)
      const mouthWidth = baseWidth * (0.3 + Math.sin(this.p5.millis() * 0.002) * 0.05)
      this.p5.ellipse(0, baseHeight * 0.1, mouthWidth, baseHeight * 0.1)
    }
    
    // Animação de propulsores/pernas
    const frameOffset = this.animationFrame / 8 * Math.PI * 2
    
    // Propulsores que se movem como uma onda senoidal
    for (let i = 0; i < 3; i++) {
      const angle = Math.PI/2 + (i - 1) * Math.PI/4
      const thrusterX = Math.cos(angle) * baseWidth * 0.6
      const thrusterY = Math.sin(angle) * baseHeight * 0.6
      
      // Animação dos propulsores
      const thrusterAnim = Math.sin(frameOffset + i) * 0.2
      const thrusterSize = baseWidth * 0.25 * (1 + thrusterAnim)
      
      // Desenha propulsor
      this.p5.fill(30, 100, 150)
      this.p5.ellipse(thrusterX, thrusterY, thrusterSize, thrusterSize)
      
      // Chama do propulsor quando se movendo
      if ((this.isRunning || this.isJumping) && Math.random() > 0.3) {
        this.p5.fill(200, 100, 0, 150)
        this.p5.ellipse(
          thrusterX + (this.isJumping ? 0 : (Math.random() - 0.5) * 5),
          thrusterY + baseHeight * 0.1,
          thrusterSize * 0.7,
          thrusterSize * 1.2
        )
        
        this.p5.fill(255, 200, 0, 100)
        this.p5.ellipse(
          thrusterX + (this.isJumping ? 0 : (Math.random() - 0.5) * 3),
          thrusterY + baseHeight * 0.15,
          thrusterSize * 0.5,
          thrusterSize * 0.8
        )
      }
    }
    
    this.p5.pop()
  }

  getShootDirection(): { x: number, y: number } {
    if (!this.ring) return { x: 0, y: -1 };
    
    // Direção do centro do planeta para o jogador
    const dirX = this.x - this.ring.centerX;
    const dirY = this.y - this.ring.centerY;
    
    // Normaliza o vetor
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    return {
      x: dirX / length,
      y: dirY / length
    };
  }

  shoot(gameTime: number): boolean {
    if (gameTime - this.lastShootTime > this.shootCooldown) {
      this.lastShootTime = gameTime;
      return true;
    }
    return false;
  }

  takeHit(): void {
    if (this.hasShield) {
      // Se tem escudo, não recebe dano mas perde o escudo
      this.hasShield = false;
      return;
    }
    
    // Aplica efeito visual de dano
    this.damageEffect = 1.0;
  }

  // Método para obter a hitbox do jogador
  getHitbox(): { x: number, y: number, width: number, height: number } {
    // Reduz um pouco a hitbox para ser mais amigável nas colisões
    const hitboxReduction = 0.8;
    return {
      x: this.x - (this.width * hitboxReduction) / 2,
      y: this.y - (this.height * hitboxReduction) / 2,
      width: this.width * hitboxReduction,
      height: this.height * hitboxReduction
    };
  }

  // Alias para ativar o efeito de dano visual
  showDamageEffect(): void {
    this.damageEffect = 1.0;
  }

  applyPowerUp(type: string, duration: number = 5): void {
    switch (type) {
      case "shield":
        this.hasShield = true;
        this.shieldTimer = duration;
        break;
      case "speed":
        this.hasSpeedBoost = true;
        this.speedTimer = duration;
        break;
    }
  }

  shieldTimer: number = 0;
  speedTimer: number = 0;
}
