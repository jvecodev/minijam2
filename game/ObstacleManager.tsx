import type p5Types from "p5"
import type { Ring } from "./Ring"
import type { Player } from "./Player"

interface Obstacle {
  angle: number
  radius: number
  size: number
  type: "meteor" | "ice" | "gap"
  active: boolean
}

export class ObstacleManager {
  p5: p5Types
  ring: Ring
  obstacles: Obstacle[]

  constructor(p5: p5Types, ring: Ring) {
    this.p5 = p5
    this.ring = ring
    this.obstacles = []

    // Add initial obstacles
    this.addObstacles(1)
  }

  addObstacles(level: number) {
    // Number of obstacles based on level
    const count = 3 + Math.min(7, level)

    for (let i = 0; i < count; i++) {
      // Random angle placement
      const angle = this.p5.random(this.p5.TWO_PI)

      // Random obstacle type
      const typeRand = this.p5.random()
      let type: "meteor" | "ice" | "gap"

      if (typeRand < 0.4) {
        type = "meteor"
      } else if (typeRand < 0.7) {
        type = "ice"
      } else {
        type = "gap"
      }

      // Add obstacle
      this.obstacles.push({
        angle,
        radius: this.ring.innerRadius + (this.ring.outerRadius - this.ring.innerRadius) / 2,
        size: type === "gap" ? 40 : 20,
        type,
        active: true,
      })
    }
  }

  update(speed: number) {
    // Remove inactive obstacles
    this.obstacles = this.obstacles.filter((obs) => obs.active)
  }

  draw() {
    this.p5.push()

    for (const obstacle of this.obstacles) {
      if (!obstacle.active) continue

      const pos = this.ring.getPointOnRing(obstacle.angle)

      switch (obstacle.type) {
        case "meteor":
          // Draw meteor
          this.p5.fill(100, 80, 80)
          this.p5.stroke(80, 60, 60)
          this.p5.strokeWeight(2)
          this.p5.ellipse(pos.x, pos.y, obstacle.size, obstacle.size)

          // Add some texture
          this.p5.fill(120, 100, 100)
          this.p5.noStroke()
          this.p5.ellipse(
            pos.x - obstacle.size * 0.2,
            pos.y - obstacle.size * 0.2,
            obstacle.size * 0.3,
            obstacle.size * 0.3,
          )
          break

        case "ice":
          // Draw ice chunk
          this.p5.fill(200, 220, 255, 200)
          this.p5.stroke(150, 180, 255)
          this.p5.strokeWeight(1)

          // Draw irregular ice shape
          this.p5.beginShape()
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * this.p5.TWO_PI
            const rad = obstacle.size * 0.5 * (0.8 + this.p5.random(0.4))
            const px = pos.x + rad * this.p5.cos(angle)
            const py = pos.y + rad * this.p5.sin(angle)
            this.p5.vertex(px, py)
          }
          this.p5.endShape(this.p5.CLOSE)

          // Add shine
          this.p5.fill(255, 255, 255, 150)
          this.p5.noStroke()
          this.p5.ellipse(
            pos.x - obstacle.size * 0.1,
            pos.y - obstacle.size * 0.1,
            obstacle.size * 0.4,
            obstacle.size * 0.2,
          )
          break

        case "gap":
          // Draw gap in the ring
          const ringWidth = this.ring.outerRadius - this.ring.innerRadius
          const gapWidth = obstacle.size
          const gapAngle = gapWidth / obstacle.radius

          this.p5.fill(0, 0, 0, 150)
          this.p5.noStroke()

          this.p5.arc(
            this.ring.centerX,
            this.ring.centerY,
            (obstacle.radius + ringWidth / 2) * 2,
            (obstacle.radius + ringWidth / 2) * 2,
            obstacle.angle - gapAngle / 2,
            obstacle.angle + gapAngle / 2,
          )

          this.p5.fill(0)
          this.p5.arc(
            this.ring.centerX,
            this.ring.centerY,
            (obstacle.radius - ringWidth / 2) * 2,
            (obstacle.radius - ringWidth / 2) * 2,
            obstacle.angle - gapAngle / 2,
            obstacle.angle + gapAngle / 2,
          )
          break
      }
    }

    this.p5.pop()
  }

  checkCollision(player: Player): boolean {
    for (const obstacle of this.obstacles) {
      if (!obstacle.active) continue

      const pos = this.ring.getPointOnRing(obstacle.angle)
      const playerRadius = player.getCollisionRadius()

      // For gaps, check if player is over the gap and not jumping
      if (obstacle.type === "gap") {
        const gapAngle = obstacle.size / obstacle.radius
        const angleDiff = Math.abs(player.angle - obstacle.angle)

        // If player is over the gap and not jumping
        if (angleDiff < gapAngle / 2 && !player.isJumping) {
          obstacle.active = false
          return true
        }
      }
      // For other obstacles, check distance
      else {
        const distance = this.p5.dist(player.x, player.y, pos.x, pos.y)

        if (distance < playerRadius + obstacle.size / 2) {
          // If player has shield, just deactivate the obstacle
          if (player.hasShield) {
            obstacle.active = false
            return false
          }

          // Otherwise, collision occurred
          obstacle.active = false
          return true
        }
      }
    }

    return false
  }
}
