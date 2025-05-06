import type p5Types from "p5"

interface PowerUp {
  x: number
  y: number
  width: number
  height: number
  type: "crystal" | "shield" | "speedBoost"
  active: boolean
  rotation: number
  floatOffset: number
}

export class PowerUpManager {
  p5: p5Types
  powerUps: PowerUp[]
  groundY: number
  groundHeight: number
  floatTimer: number

  constructor(p5: p5Types, groundY: number, groundHeight: number) {
    this.p5 = p5
    this.powerUps = []
    this.groundY = groundY
    this.groundHeight = groundHeight
    this.floatTimer = 0
  }

  update(gameSpeed: number, deltaTime: number) {
    // Atualiza o timer de flutuação
    this.floatTimer += deltaTime * 5

    // Move os power-ups da direita para a esquerda
    for (const powerUp of this.powerUps) {
      powerUp.x -= gameSpeed * deltaTime * 60
      powerUp.rotation += deltaTime * 3

      // Efeito de flutuação
      powerUp.floatOffset = Math.sin(this.floatTimer + powerUp.x * 0.01) * 10

      // Remove power-ups que saíram da tela
      if (powerUp.x < -powerUp.width) {
        powerUp.active = false
      }
    }

    // Remove power-ups inativos
    this.powerUps = this.powerUps.filter((pu) => pu.active)
  }

  draw() {
    this.p5.push()

    for (const powerUp of this.powerUps) {
      if (!powerUp.active) continue

      // Aplica o efeito de flutuação
      const displayY = powerUp.y + powerUp.floatOffset

      if (powerUp.type === "crystal") {
        // Desenha cristal
        this.p5.push()
        this.p5.translate(powerUp.x + powerUp.width / 2, displayY + powerUp.height / 2)
        this.p5.rotate(powerUp.rotation)

        this.p5.fill(0, 200, 255, 200)
        this.p5.stroke(0, 150, 200)
        this.p5.strokeWeight(1)

        // Forma de diamante
        this.p5.beginShape()
        this.p5.vertex(0, -powerUp.height / 2)
        this.p5.vertex(powerUp.width / 2, 0)
        this.p5.vertex(0, powerUp.height / 2)
        this.p5.vertex(-powerUp.width / 2, 0)
        this.p5.endShape(this.p5.CLOSE)

        // Brilho
        this.p5.fill(255, 255, 255, 150)
        this.p5.noStroke()
        this.p5.ellipse(-powerUp.width * 0.2, -powerUp.height * 0.2, powerUp.width * 0.5)

        this.p5.pop()
      } else if (powerUp.type === "shield") {
        // Desenha escudo
        this.p5.push()
        this.p5.translate(powerUp.x + powerUp.width / 2, displayY + powerUp.height / 2)
        this.p5.rotate(powerUp.rotation)

        // Anel externo
        this.p5.noFill()
        this.p5.stroke(0, 255, 200)
        this.p5.strokeWeight(3)
        this.p5.ellipse(0, 0, powerUp.width * 1.5)

        // Anel interno
        this.p5.fill(0, 255, 200, 50)
        this.p5.ellipse(0, 0, powerUp.width)

        this.p5.pop()
      } else if (powerUp.type === "speedBoost") {
        // Desenha boost de velocidade
        this.p5.push()
        this.p5.translate(powerUp.x + powerUp.width / 2, displayY + powerUp.height / 2)

        // Forma de foguete/seta
        this.p5.fill(255, 150, 0)
        this.p5.stroke(200, 100, 0)
        this.p5.strokeWeight(1)

        // Corpo do foguete
        this.p5.beginShape()
        this.p5.vertex(0, -powerUp.height / 2)
        this.p5.vertex(powerUp.width / 2, 0)
        this.p5.vertex(powerUp.width / 3, 0)
        this.p5.vertex(powerUp.width / 3, powerUp.height / 2)
        this.p5.vertex(-powerUp.width / 3, powerUp.height / 2)
        this.p5.vertex(-powerUp.width / 3, 0)
        this.p5.vertex(-powerUp.width / 2, 0)
        this.p5.endShape(this.p5.CLOSE)

        // Chamas
        this.p5.fill(255, 100, 0, 150 + Math.sin(this.floatTimer * 2) * 50)
        this.p5.noStroke()

        this.p5.beginShape()
        this.p5.vertex(-powerUp.width * 0.2, powerUp.height / 2)
        this.p5.vertex(0, powerUp.height)
        this.p5.vertex(powerUp.width * 0.2, powerUp.height / 2)
        this.p5.endShape(this.p5.CLOSE)

        this.p5.pop()
      }
    }

    this.p5.pop()
  }

  spawnPowerUp() {
    // Limita o número máximo de power-ups ativos
    if (this.powerUps.length >= 3) return

    // Probabilidades de cada tipo
    const rand = this.p5.random()
    let type: "crystal" | "shield" | "speedBoost"

    if (rand < 0.6) {
      type = "crystal"
    } else if (rand < 0.8) {
      type = "shield"
    } else {
      type = "speedBoost"
    }

    // Tamanho baseado no tipo
    const size = 30

    // Posição Y aleatória (no anel ou um pouco acima)
    const yPos = this.groundY - this.groundHeight / 2 - this.p5.random(50, 150)

    // Cria o power-up na direita da tela
    this.powerUps.push({
      x: this.p5.width + size,
      y: yPos,
      width: size,
      height: size,
      type,
      active: true,
      rotation: this.p5.random(this.p5.TWO_PI),
      floatOffset: 0,
    })
  }

  getPowerUps() {
    return this.powerUps
  }

  updateDimensions(groundY: number, groundHeight: number) {
    this.groundY = groundY
    this.groundHeight = groundHeight
  }
}
