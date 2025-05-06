import type p5Types from "p5"

export class Player {
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
  }

  update(isJumpKeyPressed: boolean, deltaTime: number, groundY: number) {
    this.groundY = groundY

    // Atualiza o timer de animação
    this.animationTimer += deltaTime
    if (this.animationTimer >= 0.1) {
      // Muda o frame a cada 0.1 segundos
      this.animationFrame = (this.animationFrame + 1) % 4
      this.animationTimer = 0
    }

    // Aplica gravidade
    this.velocityY += this.gravity * deltaTime

    // Atualiza a posição Y
    this.y += this.velocityY

    // Verifica colisão com o chão
    if (this.y >= this.groundY) {
      this.y = this.groundY
      this.velocityY = 0
      this.isJumping = false
      this.isRunning = true
    } else {
      this.isJumping = true
      this.isRunning = false
    }

    // Reduz o efeito de dano gradualmente
    if (this.damageEffect > 0) {
      this.damageEffect -= deltaTime * 2
    }
  }

  draw() {
    this.p5.push()

    // Efeito de dano (pisca em vermelho)
    if (this.damageEffect > 0 && Math.floor(this.damageEffect * 10) % 2 === 0) {
      this.p5.fill(255, 0, 0)
    } else {
      this.p5.fill(255, 100, 100)
    }

    // Desenha escudo se ativo
    if (this.hasShield) {
      this.p5.stroke(0, 200, 255)
      this.p5.strokeWeight(2)
      this.p5.fill(0, 200, 255, 50)
      this.p5.ellipse(this.x, this.y, this.width * 2, this.height * 1.5)
    }

    // Desenha efeito de velocidade se ativo
    if (this.hasSpeedBoost) {
      this.p5.noStroke()
      this.p5.fill(255, 200, 0, 150)

      // Trilha de velocidade
      for (let i = 1; i <= 5; i++) {
        this.p5.ellipse(this.x - i * 8, this.y, this.width * (1 - i * 0.15), this.height * (1 - i * 0.15))
      }
    }

    // Desenha o jogador
    this.p5.stroke(200, 50, 50)
    this.p5.strokeWeight(2)
    this.p5.fill(255, 100, 100)

    // Corpo principal
    this.p5.ellipse(this.x, this.y - this.height / 3, this.width, this.height / 2)

    // Pernas (animadas)
    if (this.isRunning) {
      // Animação de corrida
      const legOffset = Math.sin(this.animationFrame * (Math.PI / 2)) * 10

      // Perna esquerda
      this.p5.line(this.x - this.width / 4, this.y - this.height / 4, this.x - this.width / 3, this.y + legOffset)

      // Perna direita
      this.p5.line(this.x + this.width / 4, this.y - this.height / 4, this.x + this.width / 3, this.y - legOffset)
    } else {
      // Animação de pulo
      this.p5.line(this.x - this.width / 4, this.y - this.height / 4, this.x - this.width / 3, this.y + this.height / 4)

      this.p5.line(this.x + this.width / 4, this.y - this.height / 4, this.x + this.width / 3, this.y + this.height / 4)
    }

    // Braços
    if (this.isJumping) {
      // Braços levantados durante o pulo
      this.p5.line(this.x - this.width / 4, this.y - this.height / 3, this.x - this.width / 2, this.y - this.height / 2)

      this.p5.line(this.x + this.width / 4, this.y - this.height / 3, this.x + this.width / 2, this.y - this.height / 2)
    } else {
      // Braços balançando durante a corrida
      const armOffset = Math.cos(this.animationFrame * (Math.PI / 2)) * 10

      this.p5.line(
        this.x - this.width / 4,
        this.y - this.height / 3,
        this.x - this.width / 2,
        this.y - this.height / 4 + armOffset,
      )

      this.p5.line(
        this.x + this.width / 4,
        this.y - this.height / 3,
        this.x + this.width / 2,
        this.y - this.height / 4 - armOffset,
      )
    }

    // Detalhes do jogador (olhos, etc.)
    this.p5.fill(255)
    this.p5.noStroke()

    // Olhos
    const eyeOffset = this.width * 0.15
    this.p5.ellipse(this.x + eyeOffset, this.y - this.height / 3, this.width * 0.2)
    this.p5.ellipse(this.x - eyeOffset, this.y - this.height / 3, this.width * 0.2)

    // Pupilas
    this.p5.fill(0)
    this.p5.ellipse(this.x + eyeOffset, this.y - this.height / 3, this.width * 0.1)
    this.p5.ellipse(this.x - eyeOffset, this.y - this.height / 3, this.width * 0.1)

    this.p5.pop()
  }

  jump() {
    if (!this.isJumping) {
      this.velocityY = this.jumpForce
      this.isJumping = true
      this.isRunning = false
    }
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    }
  }

  showDamageEffect() {
    this.damageEffect = 1
  }

  setPosition(x: number, y: number) {
    this.x = x
    this.y = y
    this.groundY = y
  }
}
