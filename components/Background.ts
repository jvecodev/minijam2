import type p5Types from "p5"

interface Star {
  x: number
  y: number
  size: number
  speed: number
  brightness: number
  twinkleSpeed: number
}

export class Background {
  p5: p5Types
  stars: Star[]
  parallaxLayers: number

  constructor(p5: p5Types) {
    this.p5 = p5
    this.stars = []
    this.parallaxLayers = 3

    // Cria estrelas em diferentes camadas de paralaxe
    for (let layer = 0; layer < this.parallaxLayers; layer++) {
      const layerSpeed = 0.2 + layer * 0.4 // Camadas mais distantes movem-se mais devagar
      const starCount = 50 + layer * 50 // Mais estrelas nas camadas mais distantes

      for (let i = 0; i < starCount; i++) {
        this.stars.push({
          x: this.p5.random(this.p5.width),
          y: this.p5.random(this.p5.height),
          size: this.p5.random(1, 3) / (layer + 1), // Estrelas mais distantes são menores
          speed: layerSpeed,
          brightness: this.p5.random(150, 255),
          twinkleSpeed: this.p5.random(0.01, 0.05),
        })
      }
    }
  }

  update(gameSpeed: number) {
    // Move as estrelas com efeito de paralaxe
    for (const star of this.stars) {
      star.x -= gameSpeed * star.speed

      // Reposiciona estrelas que saíram da tela
      if (star.x < 0) {
        star.x = this.p5.width
        star.y = this.p5.random(this.p5.height)
      }

      // Efeito de cintilação
      star.brightness = 150 + Math.abs(Math.sin(this.p5.frameCount * star.twinkleSpeed) * 105)
    }
  }

  draw() {
    // Fundo gradiente
    this.p5.background(0)

    // Desenha as estrelas
    for (const star of this.stars) {
      this.p5.fill(star.brightness)
      this.p5.noStroke()
      this.p5.ellipse(star.x, star.y, star.size)
    }

    // Nebulosa distante (efeito decorativo)
    this.p5.push()
    this.p5.noStroke()

    // Nebulosa azul
    this.p5.fill(20, 40, 100, 20)
    this.p5.ellipse(this.p5.width * 0.7, this.p5.height * 0.3, this.p5.width * 0.5, this.p5.height * 0.4)

    // Nebulosa roxa
    this.p5.fill(60, 20, 80, 15)
    this.p5.ellipse(this.p5.width * 0.3, this.p5.height * 0.8, this.p5.width * 0.6, this.p5.height * 0.3)

    this.p5.pop()
  }
}
