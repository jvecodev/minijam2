import type p5Types from "p5"

export class Ring {
  p5: p5Types
  centerX: number
  centerY: number
  innerRadius: number
  outerRadius: number
  segments: number
  segmentColors: Array<{ r: number; g: number; b: number }>

  constructor(p5: p5Types, centerX: number, centerY: number) {
    this.p5 = p5
    this.centerX = centerX
    this.centerY = centerY

    // Ring dimensions
    const minDimension = this.p5.min(p5.width, p5.height)
    this.outerRadius = minDimension * 0.4
    this.innerRadius = minDimension * 0.3

    // Segments for visual effect
    this.segments = 12
    this.segmentColors = []

    // Generate segment colors
    for (let i = 0; i < this.segments; i++) {
      this.segmentColors.push({
        r: this.p5.random(180, 230),
        g: this.p5.random(180, 230),
        b: this.p5.random(100, 150),
      })
    }
  }

  draw() {
    this.p5.push()
    this.p5.translate(this.centerX, this.centerY)

    // Draw ring segments
    for (let i = 0; i < this.segments; i++) {
      const startAngle = (i / this.segments) * this.p5.TWO_PI
      const endAngle = ((i + 1) / this.segments) * this.p5.TWO_PI

      const color = this.segmentColors[i]
      this.p5.fill(color.r, color.g, color.b, 200)
      this.p5.stroke(color.r * 0.8, color.g * 0.8, color.b * 0.8)
      this.p5.strokeWeight(1)

      this.p5.arc(0, 0, this.outerRadius * 2, this.outerRadius * 2, startAngle, endAngle, this.p5.PIE)
      this.p5.fill(0)
      this.p5.arc(0, 0, this.innerRadius * 2, this.innerRadius * 2, startAngle, endAngle, this.p5.PIE)
    }

    this.p5.pop()
  }

  getPointOnRing(angle: number) {
    const radius = this.innerRadius + (this.outerRadius - this.innerRadius) / 2
    const x = this.centerX + radius * this.p5.cos(angle)
    const y = this.centerY + radius * this.p5.sin(angle)
    return { x, y }
  }
}
