import type p5Types from "p5"
import type { Ring } from "./Ring"
import type { Player } from "./Player"

interface Collectible {
  angle: number
  radius: number
  size: number
  type: "crystal" | "boost" | "shield"
  active: boolean
  rotation: number
}

export class CollectibleManager {
  p5: p5Types
  ring: Ring
  collectibles: Collectible[]

  constructor(p5: p5Types, ring: Ring) {
    this.p5 = p5
    this.ring = ring
    this.collectibles = []

    // Add initial collectibles
    this.addCollectibles(1)
  }

  addCollectibles(level: number) {
    // Number of collectibles based on level
    const count = 2 + Math.min(3, level)

    for (let i = 0; i < count; i++) {
      // Random angle placement
      const angle = this.p5.random(this.p5.TWO_PI)

      // Random collectible type
      const typeRand = this.p5.random()
      let type: "crystal" | "boost" | "shield"

      if (typeRand < 0.6) {
        type = "crystal"
      } else if (typeRand < 0.8) {
        type = "boost"
      } else {
        type = "shield"
      }

      // Add collectible
      this.collectibles.push({
        angle,
        radius: this.ring.innerRadius + (this.ring.outerRadius - this.ring.innerRadius) / 2,
        size: 20,
        type,
        active: true,
        rotation: 0,
      })
    }
  }

  update(speed: number) {
    // Remove inactive collectibles
    this.collectibles = this.collectibles.filter((col) => col.active)

    // Update rotation for visual effect
    for (const collectible of this.collectibles) {
      collectible.rotation += 0.02
    }
  }

  draw() {
    this.p5.push()

    for (const collectible of this.collectibles) {
      if (!collectible.active) continue

      const pos = this.ring.getPointOnRing(collectible.angle)

      // Add floating effect
      const floatOffset = this.p5.sin(this.p5.frameCount * 0.05) * 5

      switch (collectible.type) {
        case "crystal":
          // Draw crystal
          this.p5.push()
          this.p5.translate(pos.x, pos.y + floatOffset)
          this.p5.rotate(collectible.rotation)

          this.p5.fill(0, 200, 255, 200)
          this.p5.stroke(0, 150, 200)
          this.p5.strokeWeight(1)

          // Draw diamond shape
          this.p5.beginShape()
          this.p5.vertex(0, -collectible.size / 2)
          this.p5.vertex(collectible.size / 2, 0)
          this.p5.vertex(0, collectible.size / 2)
          this.p5.vertex(-collectible.size / 2, 0)
          this.p5.endShape(this.p5.CLOSE)

          // Add shine
          this.p5.fill(255, 255, 255, 150)
          this.p5.noStroke()
          this.p5.ellipse(
            -collectible.size * 0.1,
            -collectible.size * 0.1,
            collectible.size * 0.3,
            collectible.size * 0.3,
          )

          this.p5.pop()
          break

        case "boost":
          // Draw boost
          this.p5.push()
          this.p5.translate(pos.x, pos.y + floatOffset)

          // Draw rocket shape
          this.p5.fill(255, 150, 50)
          this.p5.stroke(200, 100, 0)
          this.p5.strokeWeight(1)

          // Rocket body
          this.p5.ellipse(0, 0, collectible.size * 0.8, collectible.size * 1.2)

          // Rocket fins
          this.p5.triangle(
            -collectible.size * 0.4,
            collectible.size * 0.3,
            -collectible.size * 0.4,
            collectible.size * 0.6,
            0,
            collectible.size * 0.3,
          )
          this.p5.triangle(
            collectible.size * 0.4,
            collectible.size * 0.3,
            collectible.size * 0.4,
            collectible.size * 0.6,
            0,
            collectible.size * 0.3,
          )

          // Rocket top
          this.p5.fill(200, 200, 200)
          this.p5.ellipse(0, -collectible.size * 0.4, collectible.size * 0.5, collectible.size * 0.5)

          this.p5.pop()
          break

        case "shield":
          // Draw shield
          this.p5.push()
          this.p5.translate(pos.x, pos.y + floatOffset)
          this.p5.rotate(collectible.rotation)

          // Shield outer ring
          this.p5.noFill()
          this.p5.stroke(0, 255, 150)
          this.p5.strokeWeight(3)
          this.p5.ellipse(0, 0, collectible.size * 1.2, collectible.size * 1.2)

          // Shield inner
          this.p5.fill(0, 255, 150, 50)
          this.p5.ellipse(0, 0, collectible.size, collectible.size)

          this.p5.pop()
          break
      }
    }

    this.p5.pop()
  }

  checkCollision(player: Player): string | null {
    for (const collectible of this.collectibles) {
      if (!collectible.active) continue

      const pos = this.ring.getPointOnRing(collectible.angle)
      const playerRadius = player.getCollisionRadius()
      const distance = this.p5.dist(player.x, player.y, pos.x, pos.y)

      if (distance < playerRadius + collectible.size / 2) {
        collectible.active = false
        return collectible.type
      }
    }

    return null
  }
}
