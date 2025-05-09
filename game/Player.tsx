import type p5Types from "p5"
import type { Ring } from "./Ring"

export class Player {
  p5: p5Types
  ring: Ring
  angle: number
  radius: number
  x: number
  y: number
  size: number
  isJumping: boolean
  jumpHeight: number
  jumpVelocity: number
  gravity: number
  baseY: number
  hasShield: boolean
  thrusterAnimation: number
  shipColor: { primary: number[], secondary: number[] }
  engineGlow: number
  rotation: number
  trailPoints: Array<{x: number, y: number, age: number}>

  constructor(p5: p5Types, ring: Ring) {
    this.p5 = p5
    this.ring = ring
    this.angle = 0
    this.radius = ring.outerRadius - (ring.outerRadius - ring.innerRadius) / 2
    this.size = 25
    this.isJumping = false
    this.jumpHeight = 0
    this.jumpVelocity = 0
    this.gravity = 0.5
    this.hasShield = false
    this.thrusterAnimation = 0
    this.shipColor = {
      primary: [0, 150, 255],
      secondary: [200, 230, 255]
    }
    this.engineGlow = 1.0
    this.rotation = 0
    this.trailPoints = []

    // Calculate initial position
    this.x = this.p5.width / 2 + this.radius * this.p5.cos(this.angle)
    this.y = this.p5.height / 2 + this.radius * this.p5.sin(this.angle)
    this.baseY = this.y
  }

  update(isJumpKeyPressed: boolean, speed: number) {
    // Update angle (move around the ring)
    this.angle += speed
    if (this.angle >= this.p5.TWO_PI) {
      this.angle -= this.p5.TWO_PI
    }

    // Calculate position on the ring
    const targetX = this.p5.width / 2 + this.radius * this.p5.cos(this.angle)
    const targetY = this.p5.height / 2 + this.radius * this.p5.sin(this.angle)

    // Handle jumping
    if (isJumpKeyPressed && !this.isJumping) {
      this.isJumping = true
      this.jumpVelocity = -10
    }

    if (this.isJumping) {
      this.jumpHeight += this.jumpVelocity
      this.jumpVelocity += this.gravity

      // Check if landing
      if (this.jumpHeight >= 0) {
        this.jumpHeight = 0
        this.jumpVelocity = 0
        this.isJumping = false
      }
    }

    // Update animation
    this.thrusterAnimation += 0.2
    if (this.thrusterAnimation > this.p5.TWO_PI) {
      this.thrusterAnimation -= this.p5.TWO_PI
    }
    
    // Engine glow pulsation
    this.engineGlow = 0.8 + Math.sin(this.thrusterAnimation * 2) * 0.2
    
    // Calculate ship rotation (facing tangent to the ring)
    this.rotation = this.angle + this.p5.PI/2
    
    // Update position
    this.x = targetX
    this.baseY = targetY
    this.y = this.baseY - this.jumpHeight
    
    // Add trail points
    if (this.p5.frameCount % 2 === 0) {
      this.trailPoints.unshift({
        x: this.x,
        y: this.y,
        age: 0
      })
      
      // Limit trail length
      if (this.trailPoints.length > 10) {
        this.trailPoints.pop()
      }
    }
    
    // Update trail points age
    for (let i = 0; i < this.trailPoints.length; i++) {
      this.trailPoints[i].age += 1
    }
  }

  draw() {
    this.p5.push()
    
    // Draw trail
    this.p5.noStroke()
    for (let i = this.trailPoints.length - 1; i >= 0; i--) {
      const point = this.trailPoints[i]
      const alpha = 200 * (1 - point.age / 10)
      if (alpha <= 0) continue
      
      // Create thruster trail
      this.p5.fill(255, 100, 0, alpha)
      const size = (this.size * 0.4) * (1 - point.age / 10)
      this.p5.ellipse(point.x, point.y, size)
    }
    
    // Draw shadow on ring only when not jumping too high
    if (this.jumpHeight < this.size * 2) {
      this.p5.fill(0, 0, 0, 70)
      this.p5.noStroke()
      this.p5.ellipse(this.x, this.baseY, this.size * 0.8, this.size * 0.3)
    }
    
    // Translate to player position and rotate
    this.p5.translate(this.x, this.y)
    this.p5.rotate(this.rotation)
    
    // Draw engine glow
    const glowSize = this.size * 0.5 * this.engineGlow
    const glowOpacity = 150 * this.engineGlow
    this.p5.fill(255, 100, 0, glowOpacity)
    this.p5.ellipse(0, this.size * 0.5, glowSize, glowSize * 2)
    
    // Main thruster flame
    const flameHeight = this.size * 0.7 * (0.8 + Math.sin(this.thrusterAnimation * 5) * 0.2)
    const flameWidth = this.size * 0.3 * (0.8 + Math.cos(this.thrusterAnimation * 3) * 0.2)
    
    this.p5.fill(255, 100, 0)
    this.p5.beginShape()
    this.p5.vertex(0, this.size * 0.35)
    this.p5.vertex(-flameWidth/2, this.size * 0.5)
    this.p5.vertex(0, this.size * 0.5 + flameHeight)
    this.p5.vertex(flameWidth/2, this.size * 0.5)
    this.p5.endShape(this.p5.CLOSE)
    
    // Ship body
    this.p5.fill(this.shipColor.primary[0], this.shipColor.primary[1], this.shipColor.primary[2])
    this.p5.beginShape()
    this.p5.vertex(0, -this.size * 0.5) // Nose
    this.p5.vertex(this.size * 0.4, this.size * 0.1) // Right wing
    this.p5.vertex(this.size * 0.2, this.size * 0.3) // Right engine
    this.p5.vertex(-this.size * 0.2, this.size * 0.3) // Left engine
    this.p5.vertex(-this.size * 0.4, this.size * 0.1) // Left wing
    this.p5.endShape(this.p5.CLOSE)
    
    // Cockpit
    this.p5.fill(this.shipColor.secondary[0], this.shipColor.secondary[1], this.shipColor.secondary[2])
    this.p5.ellipse(0, -this.size * 0.1, this.size * 0.3, this.size * 0.4)
    
    // Wing details
    this.p5.stroke(this.shipColor.secondary[0], this.shipColor.secondary[1], this.shipColor.secondary[2])
    this.p5.strokeWeight(2)
    this.p5.line(this.size * 0.1, -this.size * 0.1, this.size * 0.3, this.size * 0)
    this.p5.line(-this.size * 0.1, -this.size * 0.1, -this.size * 0.3, this.size * 0)
    
    // Shield
    if (this.hasShield) {
      // Draw shield with dynamic appearance
      const shieldPulse = 0.8 + Math.sin(this.thrusterAnimation * 3) * 0.2
      this.p5.noFill()
      this.p5.strokeWeight(2)
      
      // Inner shield
      this.p5.stroke(0, 200, 255, 120)
      this.p5.ellipse(0, 0, this.size * 2.2 * shieldPulse)
      
      // Outer shield
      this.p5.stroke(0, 255, 255, 80)
      this.p5.ellipse(0, 0, this.size * 2.5)
    }
    
    this.p5.pop()
  }

  getCollisionRadius() {
    return this.size / 2
  }
}
