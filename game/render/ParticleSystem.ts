import type p5Types from "p5";
import { Position } from "@/types";

/**
 * Representa uma partícula individual
 */
export interface Particle extends Position {
  velocityX: number;
  velocityY: number;
  size: number;
  alpha: number;
  color: { r: number; g: number; b: number };
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  shape: "circle" | "square" | "triangle" | "star" | "custom";
  customDrawFunction?: (p5: p5Types, x: number, y: number, size: number) => void;
}

/**
 * Configurações para emissores de partículas
 */
export interface EmitterConfig {
  position: Position;
  velocity: { x: number; y: number; variation: number };
  size: { min: number; max: number };
  color: { r: number; g: number; b: number; variation: number };
  alpha: { start: number; end: number };
  life: { min: number; max: number };
  rate: number;
  burstCount?: number;
  rotation?: boolean;
  shape?: "circle" | "square" | "triangle" | "star" | "custom";
  customDrawFunction?: (p5: p5Types, x: number, y: number, size: number) => void;
}

/**
 * Sistema de partículas para efeitos visuais
 */
export class ParticleSystem {
  private p5: p5Types;
  private particles: Particle[];
  private emitters: Map<string, { config: EmitterConfig; active: boolean; lastEmitTime: number }>;
  private gravity: number;

  constructor(p5: p5Types) {
    this.p5 = p5;
    this.particles = [];
    this.emitters = new Map();
    this.gravity = 0; // Gravidade global, 0 por padrão
  }

  /**
   * Define a gravidade global para todas as partículas
   */
  setGravity(gravity: number): void {
    this.gravity = gravity;
  }

  /**
   * Cria um novo emissor de partículas
   */
  createEmitter(id: string, config: EmitterConfig): void {
    this.emitters.set(id, {
      config,
      active: true,
      lastEmitTime: 0
    });
  }

  /**
   * Ativa ou desativa um emissor
   */
  setEmitterActive(id: string, active: boolean): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.active = active;
    }
  }

  /**
   * Atualiza a posição de um emissor
   */
  updateEmitterPosition(id: string, position: Position): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.config.position = position;
    }
  }

  /**
   * Atualiza a configuração de um emissor
   */
  updateEmitterConfig(id: string, config: Partial<EmitterConfig>): void {
    const emitter = this.emitters.get(id);
    if (emitter) {
      emitter.config = { ...emitter.config, ...config };
    }
  }

  /**
   * Remove um emissor
   */
  removeEmitter(id: string): void {
    this.emitters.delete(id);
  }

  /**
   * Emite uma explosão de partículas em uma posição específica
   */
  emitBurst(
    position: Position, 
    count: number, 
    config: Partial<EmitterConfig> = {}
  ): void {
    // Configuração padrão
    const defaultConfig: EmitterConfig = {
      position,
      velocity: { x: 0, y: 0, variation: 2 },
      size: { min: 3, max: 8 },
      color: { r: 255, g: 255, b: 255, variation: 0 },
      alpha: { start: 255, end: 0 },
      life: { min: 0.5, max: 1.5 },
      rate: 0
    };

    // Mescla com a configuração fornecida
    const finalConfig = { ...defaultConfig, ...config };

    // Emite as partículas
    for (let i = 0; i < count; i++) {
      this.emitParticle(finalConfig);
    }
  }

  /**
   * Cria uma única partícula
   */
  private emitParticle(config: EmitterConfig): void {
    // Variação aleatória da velocidade
    const angle = Math.random() * Math.PI * 2;
    const speed = config.velocity.variation * Math.random();
    
    // Variação de cor
    const colorVar = config.color.variation;
    const r = config.color.r + (Math.random() * 2 - 1) * colorVar;
    const g = config.color.g + (Math.random() * 2 - 1) * colorVar;
    const b = config.color.b + (Math.random() * 2 - 1) * colorVar;
    
    // Calcula velocidades
    const baseVelX = config.velocity.x;
    const baseVelY = config.velocity.y;
    const velX = baseVelX + Math.cos(angle) * speed;
    const velY = baseVelY + Math.sin(angle) * speed;
    
    // Tempo de vida
    const life = config.life.min + Math.random() * (config.life.max - config.life.min);
    
    // Tamanho
    const size = config.size.min + Math.random() * (config.size.max - config.size.min);
    
    // Cria a partícula
    const particle: Particle = {
      x: config.position.x,
      y: config.position.y,
      velocityX: velX,
      velocityY: velY,
      size,
      alpha: config.alpha.start,
      color: { r, g, b },
      life,
      maxLife: life,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() * 2 - 1) * 2,
      shape: config.shape || "circle",
      customDrawFunction: config.customDrawFunction
    };
    
    this.particles.push(particle);
  }

  /**
   * Atualiza todas as partículas e emissores
   */
  update(deltaTime: number): void {
    const now = this.p5.millis() * 0.001;
    
    // Atualiza emissores
    this.emitters.forEach((emitter, id) => {
      if (emitter.active) {
        // Calcula intervalo entre emissões
        const emissionInterval = 1 / emitter.config.rate;
        
        // Verifica se é hora de emitir uma nova partícula
        if (now - emitter.lastEmitTime >= emissionInterval) {
          this.emitParticle(emitter.config);
          emitter.lastEmitTime = now;
        }
      }
    });
    
    // Atualiza as partículas existentes
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Reduz o tempo de vida
      particle.life -= deltaTime;
      
      // Remove partículas mortas
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      
      // Calcula fator de vida (1 -> 0)
      const lifeFactor = particle.life / particle.maxLife;
      
      // Atualiza posição
      particle.x += particle.velocityX * deltaTime;
      particle.y += particle.velocityY * deltaTime;
      
      // Aplica gravidade
      particle.velocityY += this.gravity * deltaTime;
        // Atualiza alpha
      if (particle.alpha > 0) {
        const startAlpha = particle.alpha; // Use o alpha atual como início
        const endAlpha = 0; // Assume fade para transparente
        particle.alpha = startAlpha * lifeFactor; // Transição linear para transparente
      }
      
      // Atualiza rotação
      if (particle.rotationSpeed) {
        particle.rotation += particle.rotationSpeed * deltaTime;
      }
    }
  }

  /**
   * Desenha todas as partículas
   */
  draw(): void {
    this.p5.noStroke();
    
    for (const particle of this.particles) {
      const { r, g, b } = particle.color;
      this.p5.fill(r, g, b, particle.alpha);
      
      this.p5.push();
      this.p5.translate(particle.x, particle.y);
      
      // Aplica rotação se a forma não for um círculo
      if (particle.shape !== "circle") {
        this.p5.rotate(particle.rotation);
      }
      
      // Desenha a forma da partícula
      switch (particle.shape) {
        case "square":
          this.p5.rect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
          break;
        case "triangle":
          this.p5.triangle(
            0, -particle.size,
            -particle.size * 0.866, particle.size / 2,
            particle.size * 0.866, particle.size / 2
          );
          break;
        case "star":
          this.drawStar(0, 0, particle.size, particle.size / 2, 5);
          break;
        case "custom":
          if (particle.customDrawFunction) {
            particle.customDrawFunction(this.p5, 0, 0, particle.size);
          }
          break;
        case "circle":
        default:
          this.p5.ellipse(0, 0, particle.size, particle.size);
          break;
      }
      
      this.p5.pop();
    }
  }

  /**
   * Limpa todas as partículas
   */
  clear(): void {
    this.particles = [];
  }

  /**
   * Desenha uma estrela (usado para partículas tipo "star")
   */
  private drawStar(x: number, y: number, outerRadius: number, innerRadius: number, points: number): void {
    let angle = this.p5.TWO_PI / points;
    let halfAngle = angle / 2.0;
    
    this.p5.beginShape();
    for (let a = 0; a < this.p5.TWO_PI; a += angle) {
      let sx = x + Math.cos(a) * outerRadius;
      let sy = y + Math.sin(a) * outerRadius;
      this.p5.vertex(sx, sy);
      sx = x + Math.cos(a + halfAngle) * innerRadius;
      sy = y + Math.sin(a + halfAngle) * innerRadius;
      this.p5.vertex(sx, sy);
    }
    this.p5.endShape(this.p5.CLOSE);
  }

  /**
   * Retorna o número atual de partículas
   */
  getParticleCount(): number {
    return this.particles.length;
  }
}
