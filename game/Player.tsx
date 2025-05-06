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

  constructor(p5: p5Types, ring: Ring) {
    this.p5 = p5
    this.ring = ring
    this.angle = 0
    this.radius = ring.outerRadius - (ring.outerRadius - ring.innerRadius) / 2
    this.size = 20
    this.isJumping = false
    this.jumpHeight = 0
    this.jumpVelocity = 0
    this.gravity = 0.5
    this.hasShield = false

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

    // Update position
    this.x = targetX
    this.baseY = targetY
    this.y = this.baseY - this.jumpHeight
  }

  draw() {
    this.p5.push()

    // Draw shadow on ring
    this.p5.fill(0, 0, 0, 100)
    this.p5.noStroke()
    this.p5.ellipse(this.x, this.baseY, this.size * 0.8, this.size * 0.3)

    // Draw player
    if (this.hasShield) {
      // Draw shield
      this.p5.fill(0, 255, 255, 80)
      this.p5.stroke(0, 200, 255)
      this.p5.strokeWeight(2)
      this.p5.ellipse(this.x, this.y, this.size * 2)
    }

    // Player body
    this.p5.fill(255, 100, 100)
    this.p5.stroke(200, 50, 50)
    this.p5.strokeWeight(2)
    this.p5.ellipse(this.x, this.y, this.size, this.size)

    // Draw face/details
    this.p5.fill(255)
    this.p5.noStroke()
    this.p5.ellipse(this.x + this.size * 0.2, this.y - this.size * 0.1, this.size * 0.3, this.size * 0.3)
    this.p5.ellipse(this.x - this.size * 0.2, this.y - this.size * 0.1, this.size * 0.3, this.size * 0.3)

    // Draw mouth
    this.p5.stroke(50)
    this.p5.strokeWeight(1)
    this.p5.noFill()
    this.p5.arc(this.x, this.y + this.size * 0.1, this.size * 0.5, this.size * 0.3, 0, this.p5.PI)

    this.p5.pop()
  }

  getCollisionRadius() {
    return this.size / 2
  }
}
