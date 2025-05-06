import type p5Types from "p5"

interface Obstacle {
  x: number
  y: number
  width: number
  height: number
  type: "meteor" | "ice"
  active: boolean
  rotation: number
}

export class ObstacleManager {
  p5: p5Types
  obstacles: Obstacle[]
  groundY: number
  groundHeight: number

  constructor(p5: p5Types, groundY: number, groundHeight: number) {
    this.p5 = p5
    this.obstacles = []
    this.groundY = groundY
    this.groundHeight = groundHeight
  }

  update(gameSpeed: number, deltaTime: number) {
    // Move os obstáculos da direita para a esquerda
    for (const obstacle of this.obstacles) {
      obstacle.x -= gameSpeed * deltaTime * 60
      obstacle.rotation += deltaTime * 2

      // Remove obstáculos que saíram da tela
      if (obstacle.x < -obstacle.width) {
        obstacle.active = false
      }
    }

    // Remove obstáculos inativos
    this.obstacles = this.obstacles.filter((obs) => obs.active)
  }

  draw() {
    this.p5.push()

    for (const obstacle of this.obstacles) {
      if (!obstacle.active) continue

      if (obstacle.type === "meteor") {
        // Desenha meteorito
        this.p5.push()
        this.p5.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2)
        this.p5.rotate(obstacle.rotation)

        this.p5.fill(100, 80, 80)
        this.p5.stroke(80, 60, 60)
        this.p5.strokeWeight(2)

        // Forma irregular do meteorito
        this.p5.beginShape()
        for (let i = 0; i < 8; i++) {
          const angle = (i / 8) * this.p5.TWO_PI
          const radius = obstacle.width * 0.5 * (0.8 + this.p5.noise(i, obstacle.rotation) * 0.4)
          const px = radius * this.p5.cos(angle)
          const py = radius * this.p5.sin(angle)
          this.p5.vertex(px, py)
        }
        this.p5.endShape(this.p5.CLOSE)

        // Crateras
        this.p5.fill(80, 60, 60)
        this.p5.noStroke()
        this.p5.ellipse(obstacle.width * 0.2, -obstacle.width * 0.2, obstacle.width * 0.3)
        this.p5.ellipse(-obstacle.width * 0.3, obstacle.width * 0.1, obstacle.width * 0.2)

        this.p5.pop()
      } else if (obstacle.type === "ice") {
        // Desenha fragmento de gelo
        this.p5.push()
        this.p5.translate(obstacle.x + obstacle.width / 2, obstacle.y + obstacle.height / 2)
        this.p5.rotate(obstacle.rotation)

        this.p5.fill(200, 220, 255, 200)
        this.p5.stroke(150, 180, 255)
        this.p5.strokeWeight(1)

        // Forma cristalina do gelo
        this.p5.beginShape()
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * this.p5.TWO_PI
          const radius = obstacle.width * 0.5 * (0.7 + this.p5.noise(i, obstacle.rotation) * 0.6)
          const px = radius * this.p5.cos(angle)
          const py = radius * this.p5.sin(angle)
          this.p5.vertex(px, py)
        }
        this.p5.endShape(this.p5.CLOSE)

        // Brilho do gelo
        this.p5.fill(255, 255, 255, 150)
        this.p5.noStroke()
        this.p5.ellipse(0, 0, obstacle.width * 0.5)

        this.p5.pop()
      }
    }

    this.p5.pop()
  }

  spawnObstacle(level: number) {
    // Tipo aleatório de obstáculo
    const type = this.p5.random() > 0.5 ? "meteor" : "ice"

    // Tamanho baseado no tipo
    const size = type === "meteor" ? 40 : 35

    // Posição Y aleatória (no anel ou um pouco acima)
    const yPos = this.groundY - this.groundHeight / 2 - this.p5.random(0, 100)

    // Cria o obstáculo na direita da tela
    this.obstacles.push({
      x: this.p5.width + size,
      y: yPos,
      width: size,
      height: size,
      type,
      active: true,
      rotation: this.p5.random(this.p5.TWO_PI),
    })
  }

  getObstacles() {
    return this.obstacles
  }

  updateDimensions(groundY: number, groundHeight: number) {
    this.groundY = groundY
    this.groundHeight = groundHeight
  }
}
