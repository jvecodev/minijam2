import type p5Types from "p5"
import { Ring } from "@/game/Ring"
import { ObstacleType, Position, Dimensions } from "@/types"
import { ObjectPool } from "@/game/entities/ObjectPool"

interface Obstacle extends Position, Dimensions {
  angle: number
  distance: number
  width: number
  height: number
  type: ObstacleType
  active: boolean
  rotation: number
  rotationSpeed: number
  x: number
  y: number
  pulseTimer: number
  pulseFrequency: number
  pulseMagnitude: number
  wobble: number
  particleTimer: number
  color: {
    r: number;
    g: number;
    b: number;
    variation: number;
  }
  trail: {
    active: boolean;
    length: number;
    points: Array<{ x: number; y: number; age: number; size: number; }>
  }
}

export class ObstacleManager {
  p5: p5Types
  obstacles: Obstacle[]
  centerX: number
  centerY: number
  ringWidth: number
  ring: Ring | null
  obstaclePool: ObjectPool<Obstacle>

  constructor(p5: p5Types, centerX: number, ringWidth: number) {
    this.p5 = p5
    this.obstacles = []
    this.centerX = centerX
    this.centerY = p5.height / 2
    this.ringWidth = ringWidth
    this.ring = null
    
    // Inicializa o pool de obstáculos
    this.obstaclePool = new ObjectPool<Obstacle>(
      // Factory function: cria um novo obstáculo com valores padrão
      () => ({
        angle: 0,
        distance: 0,
        width: 20,
        height: 20,
        type: "meteor", // Tipo padrão, será atualizado quando o obstáculo for usado
        active: false,
        rotation: 0,
        rotationSpeed: 0,
        x: 0, 
        y: 0,
        pulseTimer: 0,
        pulseFrequency: 1,
        pulseMagnitude: 0.1,
        wobble: 0,
        particleTimer: 0,
        color: { r: 120, g: 80, b: 60, variation: 30 },
        trail: {
          active: false,
          length: 8,
          points: []
        }
      }),
      // Reset function: reinicia um obstáculo para reutilização
      (obstacle) => {
        obstacle.active = false;
        obstacle.trail.points = [];
      },
      20, // Tamanho inicial do pool
      100 // Tamanho máximo do pool
    );
  }

  setRing(ring: Ring) {
    this.ring = ring
    this.centerX = ring.centerX
    this.centerY = ring.centerY
    this.ringWidth = ring.getRingWidth()
  }

  update(gameSpeed: number, deltaTime: number): void {
    if (!this.ring) return;
    
    const time = this.p5.millis() * 0.001; // Tempo em segundos para animações
    
    // Move os obstáculos ao redor do anel
    for (const obstacle of this.obstacles) {
      // Atualiza o timer de pulsação
      obstacle.pulseTimer += deltaTime * obstacle.pulseFrequency;
      
      // Move no sentido horário (diminui o ângulo)
      obstacle.angle -= gameSpeed * deltaTime * 0.01
      
      // Adiciona uma leve oscilação no movimento
      if (obstacle.wobble > 0) {
        obstacle.angle += Math.sin(time * obstacle.pulseFrequency) * 0.002 * obstacle.wobble;
      }
      
      // Mantém o ângulo dentro de 0-2PI
      if (obstacle.angle < 0) {
        obstacle.angle += this.p5.TWO_PI
      }
      
      // Atualiza a posição com base no ângulo
      if (this.ring) {
        const pos = this.ring.getPointOnRing(obstacle.angle);
        
        // Salva a posição anterior para a trilha
        if (obstacle.trail && obstacle.trail.active && 
            (obstacle.trail.points.length === 0 || 
            this.p5.dist(obstacle.x, obstacle.y, pos.x, pos.y) > 5)) {
          
          // Adiciona um ponto à trilha
          obstacle.trail.points.unshift({
            x: obstacle.x,
            y: obstacle.y,
            age: 0,
            size: obstacle.width * 0.3 * (0.5 + Math.random() * 0.5)
          });
          
          // Limita o tamanho da trilha
          if (obstacle.trail.points.length > obstacle.trail.length) {
            obstacle.trail.points.pop();
          }
        }
        
        // Atualiza a idade dos pontos da trilha
        if (obstacle.trail && obstacle.trail.points.length > 0) {
          for (let i = 0; i < obstacle.trail.points.length; i++) {
            obstacle.trail.points[i].age += deltaTime;
          }
        }
        
        obstacle.x = pos.x;
        obstacle.y = pos.y;
        
        // Atualiza a rotação de acordo com a velocidade de rotação personalizada
        obstacle.rotation += deltaTime * obstacle.rotationSpeed;
        
        // Partículas periódicas
        obstacle.particleTimer -= deltaTime;
        if ((obstacle.type === "meteor" && obstacle.particleTimer <= 0) || 
            (obstacle.type === "ice" && Math.random() < 0.01)) {
          obstacle.particleTimer = obstacle.type === "meteor" ? 0.1 : 0.5;
          // A emissão de partículas será tratada na função de desenho
        }
      }
      
      // Remove obstáculos que completaram uma volta (para não acumular infinitamente)
      if (obstacle.angle > this.p5.TWO_PI * 0.9 && obstacle.angle < this.p5.TWO_PI) {
        obstacle.active = false;
      }
    }    // Identifica e recicla obstáculos inativos
    const inactiveObstacles = this.obstacles.filter((obs) => !obs.active);
    
    // Devolve os obstáculos inativos ao pool
    for (const obstacle of inactiveObstacles) {
      this.obstaclePool.release(obstacle);
    }
    
    // Remove obstáculos inativos da lista ativa
    this.obstacles = this.obstacles.filter((obs) => obs.active);
  }

  draw(): void {
    const time = this.p5.millis() * 0.001; // Tempo em segundos para animações
    this.p5.push();

    for (const obstacle of this.obstacles) {
      if (!obstacle.active) continue;

      // Desenha a trilha primeiro (por trás do obstáculo)
      if (obstacle.trail && obstacle.trail.active) {
        for (let i = obstacle.trail.points.length - 1; i >= 0; i--) {
          const point = obstacle.trail.points[i];
          const lifeRatio = Math.min(1, point.age / 0.8); // Desaparece após 0.8 segundos
          
          if (obstacle.type === "meteor") {
            // Trilha de fogo para meteoros
            const alpha = 150 * (1 - lifeRatio);
            this.p5.noStroke();
            
            // Partícula de fogo com degradê
            const size = point.size * (1 - lifeRatio * 0.7);
            
            // Centro mais brilhante
            this.p5.fill(255, 255, 50, alpha);
            this.p5.ellipse(point.x, point.y, size * 0.5);
            
            // Meio laranja
            this.p5.fill(255, 150, 0, alpha * 0.8);
            this.p5.ellipse(point.x, point.y, size * 0.7);
            
            // Exterior vermelho
            this.p5.fill(255, 50, 0, alpha * 0.6);
            this.p5.ellipse(point.x, point.y, size);
            
          } else {
            // Trilha de partículas de gelo 
            const alpha = 100 * (1 - lifeRatio);
            const size = point.size * (1 - lifeRatio * 0.5);
            
            this.p5.noStroke();
            this.p5.fill(200, 220, 255, alpha);
            this.p5.ellipse(point.x, point.y, size * 0.7);
            
            this.p5.fill(220, 240, 255, alpha * 0.7);
            this.p5.ellipse(point.x, point.y, size * 0.4);
          }
        }
      }

      // Salva o estado antes da rotação
      this.p5.push();
      this.p5.translate(obstacle.x, obstacle.y);
      
      // Calcula a rotação para acompanhar o anel
      const angleToCenter = Math.atan2(obstacle.y - this.centerY, obstacle.x - this.centerX);
      this.p5.rotate(angleToCenter + this.p5.PI/2);

      // Efeito de pulsação
      const pulse = 1 + Math.sin(obstacle.pulseTimer) * obstacle.pulseMagnitude;

      if (obstacle.type === "meteor") {
        // Desenha meteorito aprimorado
        this.p5.push();
        this.p5.rotate(obstacle.rotation);
        
        // Aura de calor ao redor do meteorito
        const heatRadius = obstacle.width * 1.5 * pulse;
        this.p5.noStroke();
        for (let i = 0; i < 3; i++) {
          const alpha = 50 - i * 15;
          const r = obstacle.color.r;
          const g = obstacle.color.g * 0.5;
          const b = obstacle.color.b * 0.3;
          
          this.p5.fill(r, g, b, alpha);
          this.p5.ellipse(0, 0, heatRadius + i * 10, heatRadius + i * 8);
        }
        
        // Corpo do meteorito com cores dinâmicas
        const colorShift = Math.sin(time * 2) * obstacle.color.variation;
        this.p5.fill(
          obstacle.color.r + colorShift,
          obstacle.color.g + colorShift * 0.3,
          obstacle.color.b
        );
        this.p5.noStroke();
        this.p5.ellipse(0, 0, obstacle.width * 1.2 * pulse, obstacle.height * 1.2 * pulse);
        
        // Crateras mais dinâmicas
        this.p5.fill(obstacle.color.r * 0.6, obstacle.color.g * 0.6, obstacle.color.b * 0.6);
        
        // Várias crateras em posições semi-aleatórias
        for (let i = 0; i < 3; i++) {
          const craterX = obstacle.width * 0.4 * Math.cos(obstacle.rotation * 0.2 + i * 2);
          const craterY = obstacle.height * 0.3 * Math.sin(obstacle.rotation * 0.2 + i * 2);
          const craterSize = (obstacle.width * 0.2 + i * 0.05) * pulse;
          
          this.p5.ellipse(craterX, craterY, craterSize, craterSize * 0.8);
        }
        
        // Fogo/cauda dinamicamente animada
        const flameWave = Math.sin(time * 10) * 0.2; // Oscilação rápida nas chamas
        
        // Chamas externas (laranja)
        const flameSize = obstacle.width * (1.0 + flameWave) * pulse;
        this.p5.fill(255, 100, 0, 150);
        this.p5.triangle(
          0, -obstacle.height/2,
          -flameSize/3, -flameSize,
          flameSize/3, -flameSize
        );
        
        // Chamas internas (amarelo)
        const innerFlameSize = flameSize * 0.7;
        this.p5.fill(255, 200, 0, 200);
        this.p5.triangle(
          0, -obstacle.height/2,
          -innerFlameSize/4, -innerFlameSize * 0.7,
          innerFlameSize/4, -innerFlameSize * 0.7
        );
        
        // Núcleo da chama (branco)
        const coreFlameSize = flameSize * 0.4;
        this.p5.fill(255, 255, 200, 230);
        this.p5.triangle(
          0, -obstacle.height/2,
          -coreFlameSize/5, -coreFlameSize * 0.6,
          coreFlameSize/5, -coreFlameSize * 0.6
        );
        
        // Partículas de fogo espalhadas (faíscas)
        if (obstacle.particleTimer <= 0.05) {
          for (let i = 0; i < 2; i++) {
            const sparkX = flameSize * (Math.random() - 0.5) * 0.8;
            const sparkY = -flameSize * (0.6 + Math.random() * 0.4);
            const sparkSize = obstacle.width * 0.1 * Math.random();
            
            this.p5.fill(255, 220, 100, 200);
            this.p5.ellipse(sparkX, sparkY, sparkSize);
          }
        }
        
        this.p5.pop();
      } else if (obstacle.type === "ice") {
        // Desenha obstáculo de gelo com efeitos aprimorados
        this.p5.push();
        this.p5.rotate(obstacle.rotation);
        
        // Aura gelada ao redor do cristal
        const frostRadius = obstacle.width * 1.4 * pulse;
        this.p5.noStroke();
        for (let i = 0; i < 3; i++) {
          const alpha = 40 - i * 10;
          this.p5.fill(200, 230, 255, alpha);
          this.p5.ellipse(0, 0, frostRadius + i * 8, frostRadius + i * 8);
        }
        
        // Cristal de gelo com cores dinâmicas
        const colorShift = Math.sin(time * 1.5) * obstacle.color.variation;
        this.p5.fill(
          obstacle.color.r + colorShift * 0.5,
          obstacle.color.g + colorShift * 0.7,
          obstacle.color.b,
          220
        );
        
        // Forma de cristal com efeito de pulsação 
        this.p5.beginShape();
        const sides = 8;
        const shimmer = Math.sin(time * 3) * 0.1 + 1; // Efeito de brilho oscilante
        
        for (let i = 0; i < sides; i++) {
          const angle = (i / sides) * this.p5.TWO_PI;
          // Raios alternados com efeito de pulsação
          let r;
          if (i % 2 === 0) {
            r = obstacle.width * 0.5 * pulse * shimmer;
          } else {
            r = obstacle.width * 0.25 * pulse;
          }
          
          const x = r * Math.cos(angle);
          const y = r * Math.sin(angle);
          this.p5.vertex(x, y);
        }
        this.p5.endShape(this.p5.CLOSE);
        
        // Interior do cristal (reflexos e faces internas)
        this.p5.stroke(255, 255, 255, 100);
        this.p5.strokeWeight(0.5);
        
        // Linhas internas conectando vértices
        for (let i = 0; i < 4; i++) {
          const angle1 = (i / 4) * this.p5.TWO_PI;
          const angle2 = ((i + 2) % 4) / 4 * this.p5.TWO_PI;
          
          const x1 = (obstacle.width * 0.3) * Math.cos(angle1);
          const y1 = (obstacle.width * 0.3) * Math.sin(angle1);
          const x2 = (obstacle.width * 0.3) * Math.cos(angle2);
          const y2 = (obstacle.width * 0.3) * Math.sin(angle2);
          
          this.p5.line(x1, y1, x2, y2);
        }
        
        // Vários reflexos brilhantes
        this.p5.noStroke();
        this.p5.fill(255, 255, 255, 150 + Math.sin(time * 5) * 50);
        
        // Reflexo principal que se move
        const reflexAngle = time * 1.2;
        const reflexX = Math.cos(reflexAngle) * obstacle.width * 0.25;
        const reflexY = Math.sin(reflexAngle) * obstacle.width * 0.25;
        this.p5.ellipse(reflexX, reflexY, obstacle.width * 0.15 * shimmer);
        
        // Reflexos secundários menores
        for (let i = 0; i < 2; i++) {
          const smallReflexAngle = reflexAngle + i * this.p5.PI;
          const smallReflexX = Math.cos(smallReflexAngle) * obstacle.width * 0.15;
          const smallReflexY = Math.sin(smallReflexAngle) * obstacle.width * 0.15;
          this.p5.ellipse(smallReflexX, smallReflexY, obstacle.width * 0.08);
        }
        
        // Partículas de gelo ocasionais
        if (obstacle.particleTimer <= 0.05) {
          for (let i = 0; i < 2; i++) {
            const angle = Math.random() * this.p5.TWO_PI;
            const dist = obstacle.width * 0.7;
            const x = Math.cos(angle) * dist;
            const y = Math.sin(angle) * dist;
            
            this.p5.fill(220, 240, 255, 180);
            this.p5.ellipse(x, y, obstacle.width * 0.07);
          }
        }
        
        this.p5.pop();
      }

      this.p5.pop();
    }

    this.p5.pop()
  }
  spawnObstacle(level: number, angle: number = 0) {
    // Estratégia de geração baseada no nível
    const obstaclePattern = this.getObstaclePattern(level);
    
    // Se não for fornecido um ângulo, gera um aleatório
    // Começa em um ângulo próximo a 0 (topo do anel) e vai se movendo no sentido horário (para a esquerda)
    if (angle === 0) {
      angle = this.p5.random(this.p5.PI * 0.1, this.p5.PI * 0.3);
    }
    
    // Padrões de obstáculos: a partir do nível 3, chance de criar múltiplos obstáculos
    if (level >= 3 && Math.random() < 0.2 + Math.min(level * 0.05, 0.4)) {
      this.createObstacleGroup(level, angle, obstaclePattern);
      return;
    }
    
    // Criação de obstáculo único
    this.createSingleObstacle(level, angle, obstaclePattern);
  }
  
  /**
   * Determina o padrão de obstáculos com base no nível
   */
  private getObstaclePattern(level: number) {
    // Chance de criar um obstáculo de gelo aumenta com o nível
    const iceChance = Math.min(0.1 + level * 0.05, 0.5);
    
    // Tamanho básico
    let minSize = 20;
    let maxSize = 30 + level * 1.5; // Crescimento mais suave com o nível
    
    // Limita o tamanho máximo para manter o jogo jogável
    maxSize = Math.min(maxSize, 50);
    
    // Características visuais baseadas no nível
    const trailChance = Math.min(0.3 + level * 0.1, 0.9);
    
    // Velocidade de rotação varia com o nível
    const maxRotationSpeed = 1 + (level * 0.1);
    
    return {
      type: Math.random() < iceChance ? "ice" : "meteor",
      minSize,
      maxSize,
      trailChance,
      maxRotationSpeed
    };
  }
  
  /**
   * Cria um grupo de obstáculos em padrão
   */
  private createObstacleGroup(level: number, baseAngle: number, pattern: any) {
    // Número de obstáculos no grupo
    const count = Math.min(2 + Math.floor(Math.random() * (level - 2)), 5);
    
    // Determina o tipo de padrão
    const patternType = Math.random();
    
    if (patternType < 0.3) {
      // Padrão em linha (obstáculos em sequência)
      const angleGap = 0.1 + Math.random() * 0.15;
      
      for (let i = 0; i < count; i++) {
        const angle = baseAngle + i * angleGap;
        this.createSingleObstacle(level, angle, {
          ...pattern,
          // Obstáculos em linha são menores
          minSize: pattern.minSize * 0.7,
          maxSize: pattern.maxSize * 0.8
        });
      }
    } else if (patternType < 0.6) {
      // Padrão em zig-zag
      const angleStep = 0.1 + Math.random() * 0.05;
      const zigzagWidth = 0.05 + Math.random() * 0.05;
      
      for (let i = 0; i < count; i++) {
        const offset = (i % 2 === 0) ? zigzagWidth : -zigzagWidth;
        const angle = baseAngle + i * angleStep + offset;
        this.createSingleObstacle(level, angle, {
          ...pattern,
          // Obstáculos em zig-zag são menores
          minSize: pattern.minSize * 0.8,
          maxSize: pattern.maxSize * 0.9
        });
      }
    } else {
      // Padrão em grupo denso
      for (let i = 0; i < count; i++) {
        // Espalha em uma pequena área
        const angleOffset = (Math.random() - 0.5) * 0.15;
        const angle = baseAngle + angleOffset;
        this.createSingleObstacle(level, angle, pattern);
      }
    }
  }
  
  /**
   * Cria um único obstáculo com as propriedades especificadas
   */
  private createSingleObstacle(level: number, angle: number, pattern: any) {
    // Tamanho varia com o nível, mas limitado pelos parâmetros do padrão
    const size = this.p5.random(pattern.minSize, pattern.maxSize);
    
    // Calcula a posição inicial
    let x = this.centerX;
    let y = this.centerY;
    
    if (this.ring) {
      const pos = this.ring.getPointOnRing(angle);
      x = pos.x;
      y = pos.y;
    }

    // Cores base dependendo do tipo de obstáculo
    let colorBase;
    if (pattern.type === "meteor") {
      // Variação de cores para meteoritos (marrom-vermelho-laranja)
      const redVariation = Math.random() * 40;
      colorBase = {
        r: 120 + redVariation, 
        g: 80 - redVariation * 0.3,
        b: 60 - redVariation * 0.5,
        variation: 30 + Math.random() * 20
      };
    } else {
      // Variação de cores para gelo (azul-ciano)
      const blueVariation = Math.random() * 30;
      colorBase = {
        r: 190 + blueVariation * 0.5, 
        g: 210 + blueVariation * 0.3,
        b: 255,
        variation: 20 + Math.random() * 15
      };
    }
    
    // Efeito de trilha com base na chance do padrão e tamanho do obstáculo
    const hasTrail = Math.random() < pattern.trailChance || (pattern.type === "meteor" && size > pattern.maxSize * 0.8);

    // Obtém um obstáculo do pool
    const obstacle = this.obstaclePool.get();
    if (!obstacle) return;

    // Atualiza as propriedades do obstáculo
    Object.assign(obstacle, {
      angle,
      distance: 0,
      width: size,
      height: size,
      type: pattern.type,
      active: true,
      rotation: Math.random() * this.p5.TWO_PI, // Rotação inicial aleatória
      rotationSpeed: (Math.random() * 2 - 1) * pattern.maxRotationSpeed, // Velocidade e direção de rotação limitada pelo padrão
      x, 
      y,
      pulseTimer: Math.random() * Math.PI * 2, // Fase inicial aleatória
      pulseFrequency: 1 + Math.random() * 2, // Frequência de pulsação única para cada obstáculo
      pulseMagnitude: 0.1 + Math.random() * 0.1, // Magnitude da pulsação
      wobble: Math.random() * 0.5, // Quantidade de oscilação
      particleTimer: 0, // Timer para emissão de partículas
      color: colorBase,
      trail: {
        active: hasTrail,
        length: pattern.type === "meteor" ? 8 + Math.floor(Math.random() * 5) : 5,
        points: []
      }
    });

    this.obstacles.push(obstacle);
  }

  getObstacles(): Obstacle[] {
    return this.obstacles
  }
}
