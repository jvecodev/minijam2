import type p5Types from "p5"
import { Ring } from "@/game/Ring"
import { ObjectPool } from "@/game/entities/ObjectPool"

export class Projectile {
  p5: p5Types
  x: number
  y: number
  width: number
  height: number
  speed: number
  active: boolean
  targetX: number
  targetY: number
  directionX: number
  directionY: number
  distanceTraveled: number
  maxDistance: number
  color: { r: number; g: number; b: number; }
  
  constructor(p5: p5Types, startX: number, startY: number, targetX: number, targetY: number) {
    this.p5 = p5
    this.x = startX
    this.y = startY
    this.width = 10 // Valor padrão, será alterado no init()
    this.height = 10
    this.speed = 15
    this.active = false
    this.targetX = targetX
    this.targetY = targetY
    this.directionX = 0
    this.directionY = 0
    this.distanceTraveled = 0
    this.maxDistance = p5.width * 1.5
    this.color = { r: 100, g: 100, b: 255 }
    
    this.distanceTraveled = 0
    this.maxDistance = this.p5.width * 1.5 // Para limitar a distância do tiro
    
    // Paleta de cores variada para os projéteis
    const colorSchemes = [
      { r: this.p5.random(50, 100), g: this.p5.random(150, 255), b: this.p5.random(200, 255) }, // Azul
      { r: this.p5.random(200, 255), g: this.p5.random(50, 150), b: this.p5.random(50, 100) }, // Vermelho
      { r: this.p5.random(50, 100), g: this.p5.random(200, 255), b: this.p5.random(50, 150) }, // Verde
      { r: this.p5.random(200, 255), g: this.p5.random(180, 255), b: this.p5.random(50, 100) }, // Amarelo
      { r: this.p5.random(180, 255), g: this.p5.random(100, 180), b: this.p5.random(200, 255) }  // Roxo
    ]
    this.color = colorSchemes[Math.floor(this.p5.random(colorSchemes.length))]
  }

  reset(): void {
    this.active = false;
    this.distanceTraveled = 0;
  }

  init(startX: number, startY: number, targetX: number, targetY: number): void {
    this.x = startX;
    this.y = startY;
    this.width = this.p5.random(8, 12); // Variação no tamanho dos projéteis
    this.height = this.width;
    this.speed = this.p5.random(14, 18); // Variação na velocidade
    this.active = true;
    this.targetX = targetX;
    this.targetY = targetY;
    
    // Calcula a direção normalizada para o alvo com pequena variação de trajetória
    const dx = targetX - startX + this.p5.random(-15, 15); // Pequeno desvio aleatório
    const dy = targetY - startY + this.p5.random(-15, 15);
    const distance = Math.sqrt(dx * dx + dy * dy);
    this.directionX = dx / distance;
    this.directionY = dy / distance;
    
    this.distanceTraveled = 0;
    
    // Paleta de cores variada para os projéteis
    const colorSchemes = [
      { r: this.p5.random(50, 100), g: this.p5.random(150, 255), b: this.p5.random(200, 255) }, // Azul
      { r: this.p5.random(200, 255), g: this.p5.random(50, 150), b: this.p5.random(50, 100) }, // Vermelho
      { r: this.p5.random(50, 100), g: this.p5.random(200, 255), b: this.p5.random(50, 150) }, // Verde
      { r: this.p5.random(200, 255), g: this.p5.random(180, 255), b: this.p5.random(50, 100) }, // Amarelo
      { r: this.p5.random(180, 255), g: this.p5.random(100, 180), b: this.p5.random(200, 255) }  // Roxo
    ];
    this.color = colorSchemes[Math.floor(this.p5.random(colorSchemes.length))];
  }

  update(deltaTime: number) {
    if (!this.active) return
    
    // Atualiza a posição do projétil
    const moveAmount = this.speed * deltaTime * 60
    this.x += this.directionX * moveAmount
    this.y += this.directionY * moveAmount
    this.distanceTraveled += moveAmount
    
    // Desativa o projétil se tiver ido longe demais
    if (this.distanceTraveled > this.maxDistance) {
      this.active = false
    }
    
    // Desativa se sair da tela
    const buffer = 50
    if (
      this.x < -buffer ||
      this.x > this.p5.width + buffer ||
      this.y < -buffer ||
      this.y > this.p5.height + buffer
    ) {
      this.active = false
    }
  }
  draw() {
    if (!this.active) return
    
    this.p5.push()
    
    // Animação de "pulsação" para o projétil
    const pulseRate = this.p5.millis() * 0.01 + this.distanceTraveled * 0.05
    const pulse = 1 + Math.sin(pulseRate) * 0.2
    
    // Desenha o rastro do projétil com forma mais dinâmica
    const trailLength = 5 + Math.sin(this.p5.millis() * 0.003) * 2; // Comprimento variável do rastro
    
    for (let i = 1; i <= trailLength; i++) {
      const alpha = 255 - i * 40
      this.p5.fill(this.color.r, this.color.g, this.color.b, alpha)
      this.p5.noStroke()
      
      // Adiciona um movimento ondulatório ao rastro
      const waveAmplitude = 2
      const waveFrequency = 0.2
      const offset = Math.sin(i * waveFrequency + this.p5.millis() * 0.005) * waveAmplitude
      const perpX = -this.directionY  // Vetor perpendicular à direção
      const perpY = this.directionX
      
      // Calcula a posição do rastro com ondulação
      const trailX = this.x - this.directionX * i * 4 + perpX * offset
      const trailY = this.y - this.directionY * i * 4 + perpY * offset
      
      // Tamanho variável dos segmentos do rastro
      const variableFactor = 1 - i * 0.15 + Math.sin(i + this.p5.millis() * 0.01) * 0.05
      const size = this.width * variableFactor
      
      // Forma variável (entre círculo e elipse)
      const stretchFactor = 1 + Math.sin(this.p5.millis() * 0.004 + i * 0.5) * 0.3
      this.p5.ellipse(trailX, trailY, size * stretchFactor, size / stretchFactor)
    }
    
    // Desenha o projétil principal com efeito de pulsação
    this.p5.fill(this.color.r, this.color.g, this.color.b)
    this.p5.ellipse(this.x, this.y, this.width * pulse, this.height * pulse)
    
    // Adiciona brilho no centro com movimento
    this.p5.fill(255, 255, 255, 200)
    const glowSize = 0.3 + Math.sin(this.p5.millis() * 0.008) * 0.15
    this.p5.ellipse(this.x, this.y, this.width * glowSize, this.height * glowSize)
    
    this.p5.pop()
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    }
  }
}

export class ProjectileManager {
  p5: p5Types
  projectiles: Projectile[]
  lastShotTime: number
  shotCooldown: number
  projectilePool: ObjectPool<Projectile>

  constructor(p5: p5Types) {
    this.p5 = p5
    this.projectiles = []
    this.lastShotTime = 0
    this.shotCooldown = 0.5 // Tempo em segundos entre os tiros
    
    // Inicializa o pool de projéteis
    this.projectilePool = new ObjectPool<Projectile>(
      () => new Projectile(this.p5, 0, 0, 0, 0), // Factory - cria um projétil inativo
      (proj) => proj.reset(),                  // Reset - reinicia um projétil
      20,                                       // Tamanho inicial do pool
      100                                       // Tamanho máximo do pool
    )
  }

  canShoot(currentTime: number) {
    return currentTime - this.lastShotTime >= this.shotCooldown
  }

  shoot(startX: number, startY: number, targetX: number, targetY: number, currentTime: number) {
    if (this.canShoot(currentTime)) {
      // Obtém um projétil do pool e inicializa
      const projectile = this.projectilePool.get();
      projectile.init(startX, startY, targetX, targetY);
      
      this.projectiles.push(projectile);
      this.lastShotTime = currentTime;
      return true;
    }
    return false;
  }

  update(deltaTime: number) {
    // Array para armazenar projéteis inativos
    const inactiveProjectiles: Projectile[] = [];
    
    // Atualiza todos os projéteis
    for (const projectile of this.projectiles) {
      projectile.update(deltaTime);
      
      // Coleta projéteis inativos
      if (!projectile.active) {
        inactiveProjectiles.push(projectile);
      }
    }
    
    // Devolve os projéteis inativos ao pool
    for (const inactiveProj of inactiveProjectiles) {
      this.projectilePool.release(inactiveProj);
    }
    
    // Mantém apenas os projéteis ativos na lista
    this.projectiles = this.projectiles.filter(p => p.active);
  }

  draw() {
    // Desenha todos os projéteis
    for (const projectile of this.projectiles) {
      projectile.draw()
    }
  }

  getProjectiles() {
    return this.projectiles
  }
}
