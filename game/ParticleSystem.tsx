import type p5Types from "p5"

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: p5Types.Color
  life: number
  maxLife: number
}

export class ParticleSystem {
  p5: p5Types
  particles: Particle[]

  constructor(p5: p5Types) {
    this.p5 = p5
    this.particles = []
  }

  createBurst(x: number, y: number, count: number, color: p5Types.Color) {
    for (let i = 0; i < count; i++) {
      const angle = this.p5.random(this.p5.TWO_PI)
      const speed = this.p5.random(1, 3)

      this.particles.push({
        x,
        y,
        vx: this.p5.cos(angle) * speed,
        vy: this.p5.sin(angle) * speed,
        size: this.p5.random(3, 8),
        color,
        life: 255,
        maxLife: 255,
      })
    }
  }

  update() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i]

      // Update position
      p.x += p.vx
      p.y += p.vy

      // Apply gravity
      p.vy += 0.05

      // Reduce life
      p.life -= 5

      // Remove dead particles
      if (p.life <= 0) {
        this.particles.splice(i, 1)
      }
    }
  }

  draw() {
    this.p5.push()
    this.p5.noStroke()

    for (const p of this.particles) {
      const alpha = (p.life / p.maxLife) * 255
      const c = this.p5.color(this.p5.red(p.color), this.p5.green(p.color), this.p5.blue(p.color), alpha)

      this.p5.fill(c)
      this.p5.ellipse(p.x, p.y, p.size * (p.life / p.maxLife))
    }

    this.p5.pop()
  }
}
