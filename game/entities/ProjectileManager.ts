import type p5Types from "p5";
import { ObjectPool } from "./ObjectPool";
import { Position, Dimensions } from "@/types";

// Interface para projéteis
export interface Projectile extends Position, Dimensions {
  id: number;
  directionX: number;
  directionY: number;
  speed: number;
  distanceTraveled: number;
  maxDistance: number;
  active: boolean;
  creationTime: number;
  color: { r: number; g: number; b: number; };
  trailPoints: Array<{ x: number; y: number; age: number; }>;
}

/**
 * Gerenciador de projéteis usando Object Pool
 */
export class ProjectileManager {
  private p5: p5Types;
  private projectiles: Projectile[];
  private projectilePool: ObjectPool<Projectile>;
  private nextId: number;
  private maxTrailLength: number;

  constructor(p5: p5Types) {
    this.p5 = p5;
    this.projectiles = [];
    this.nextId = 1;
    this.maxTrailLength = 6;
    
    // Inicializa o pool de projéteis
    this.projectilePool = new ObjectPool<Projectile>(
      // Factory: cria novos projéteis
      () => this.createProjectile(0, 0, 0, 0, 0),
      // Reset: reinicializa projéteis para reutilização
      (projectile) => this.resetProjectile(projectile),
      // Tamanho inicial do pool
      20,
      // Tamanho máximo do pool
      100
    );
  }

  /**
   * Cria um novo projétil
   */
  private createProjectile(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    creationTime: number
  ): Projectile {
    // Calcula a direção para o alvo
    const dirX = targetX - x;
    const dirY = targetY - y;
    
    // Normaliza o vetor de direção
    const distance = Math.sqrt(dirX * dirX + dirY * dirY);
    const normalizedDirX = dirX / distance;
    const normalizedDirY = dirY / distance;
    
    // Propriedades do projétil
    const size = this.p5.random(6, 10);
    const speed = this.p5.random(300, 350);
    
    // Cor com leve variação
    const r = 0;
    const g = this.p5.random(200, 255);
    const b = this.p5.random(180, 255);
    
    return {
      id: this.nextId++,
      x,
      y,
      width: size,
      height: size,
      directionX: normalizedDirX,
      directionY: normalizedDirY,
      speed,
      distanceTraveled: 0,
      maxDistance: this.p5.width,
      active: true,
      creationTime,
      color: { r, g, b },
      trailPoints: []
    };
  }

  /**
   * Reinicializa um projétil para ser reutilizado
   */
  private resetProjectile(projectile: Projectile): void {
    projectile.active = false;
    projectile.trailPoints = [];
    projectile.distanceTraveled = 0;
  }

  /**
   * Atualiza todos os projéteis ativos
   */
  update(deltaTime: number): void {
    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      
      // Salva a posição atual para a trilha
      if (projectile.trailPoints.length === 0 || 
          this.p5.dist(
            projectile.x, 
            projectile.y, 
            projectile.trailPoints[0].x, 
            projectile.trailPoints[0].y
          ) > 5) {
        
        projectile.trailPoints.unshift({
          x: projectile.x,
          y: projectile.y,
          age: 0
        });
        
        // Limita o tamanho da trilha
        if (projectile.trailPoints.length > this.maxTrailLength) {
          projectile.trailPoints.pop();
        }
      }
      
      // Atualiza a idade dos pontos da trilha
      for (let i = 0; i < projectile.trailPoints.length; i++) {
        projectile.trailPoints[i].age += deltaTime;
      }
      
      // Atualiza a posição
      const moveDistance = projectile.speed * deltaTime;
      projectile.x += projectile.directionX * moveDistance;
      projectile.y += projectile.directionY * moveDistance;
      
      // Atualiza a distância percorrida
      projectile.distanceTraveled += moveDistance;
      
      // Verifica se o projétil atingiu a distância máxima ou saiu da tela
      if (projectile.distanceTraveled > projectile.maxDistance || 
          projectile.x < 0 || 
          projectile.x > this.p5.width || 
          projectile.y < 0 || 
          projectile.y > this.p5.height) {
        this.deactivateProjectile(projectile);
      }
    }
    
    // Remove projéteis inativos da lista e os devolve ao pool
    const activeProjectiles = this.projectiles.filter(p => p.active);
    
    // Devolve projéteis inativos ao pool
    const inactiveProjectiles = this.projectiles.filter(p => !p.active);
    for (const projectile of inactiveProjectiles) {
      this.projectilePool.release(projectile);
    }
    
    this.projectiles = activeProjectiles;
  }

  /**
   * Desenha todos os projéteis ativos
   */
  draw(): void {
    this.p5.push();
    
    for (const projectile of this.projectiles) {
      if (!projectile.active) continue;
      
      // Desenha primeiro a trilha
      for (let i = projectile.trailPoints.length - 1; i >= 0; i--) {
        const point = projectile.trailPoints[i];
        const lifeRatio = Math.min(1, point.age / 0.5); // Desaparece após 0.5 segundos
        const alpha = 150 * (1 - lifeRatio);
        const size = projectile.width * (1 - lifeRatio * 0.5);
        
        this.p5.noStroke();
        this.p5.fill(projectile.color.r, projectile.color.g, projectile.color.b, alpha);
        this.p5.ellipse(point.x, point.y, size, size);
      }
      
      // Desenha núcleo do projétil com efeito de brilho
      // Glow externo
      this.p5.noStroke();
      this.p5.fill(projectile.color.r, projectile.color.g, projectile.color.b, 100);
      this.p5.ellipse(projectile.x, projectile.y, projectile.width * 1.5, projectile.width * 1.5);
      
      // Projétil principal
      this.p5.fill(projectile.color.r, projectile.color.g, projectile.color.b);
      this.p5.ellipse(projectile.x, projectile.y, projectile.width, projectile.width);
      
      // Centro brilhante
      this.p5.fill(255);
      this.p5.ellipse(projectile.x, projectile.y, projectile.width * 0.5, projectile.width * 0.5);
    }
    
    this.p5.pop();
  }

  /**
   * Dispara um novo projétil
   */
  shoot(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    creationTime: number
  ): Projectile {
    // Obtém um projétil do pool
    const projectile = this.projectilePool.get();
    
    // Reinicializa com novas propriedades
    projectile.x = x;
    projectile.y = y;
    projectile.active = true;
    projectile.creationTime = creationTime;
    projectile.trailPoints = [];
    
    // Calcula a direção para o alvo
    const dirX = targetX - x;
    const dirY = targetY - y;
    
    // Normaliza o vetor de direção
    const distance = Math.sqrt(dirX * dirX + dirY * dirY);
    projectile.directionX = dirX / distance;
    projectile.directionY = dirY / distance;
    
    // Atualiza as propriedades visuais
    const size = this.p5.random(6, 10);
    projectile.width = size;
    projectile.height = size;
    
    // Cor com leve variação
    projectile.color.r = 0;
    projectile.color.g = this.p5.random(200, 255);
    projectile.color.b = this.p5.random(180, 255);
    
    // Reinicia a distância percorrida
    projectile.distanceTraveled = 0;
    
    // Adiciona à lista de projéteis ativos
    this.projectiles.push(projectile);
    
    return projectile;
  }

  /**
   * Desativa um projétil e o devolve ao pool
   */
  deactivateProjectile(projectile: Projectile): void {
    projectile.active = false;
  }

  /**
   * Limpa todos os projéteis ativos
   */
  clearProjectiles(): void {
    // Devolve todos os projéteis ao pool
    for (const projectile of this.projectiles) {
      this.projectilePool.release(projectile);
    }
    
    this.projectiles = [];
  }

  /**
   * Retorna todos os projéteis ativos
   */
  getProjectiles(): Projectile[] {
    return this.projectiles.filter(projectile => projectile.active);
  }
}
