import type p5Types from "p5"
import { Ring } from "@/game/Ring"
import { PowerUpType, Position, Dimensions } from "@/types"
import { ObjectPool } from "@/game/entities/ObjectPool"

interface PowerUp extends Position, Dimensions {
  angle: number
  type: PowerUpType
  active: boolean
  animation: number
  pulseFrequency: number
  rotationSpeed: number
  orbitRadius: number
  orbitPhase: number
  particleTimer: number
  glowSize: number
  glowOpacity: number
  trailPoints: Array<{x: number, y: number, age: number, size: number}>
}

export class PowerUpManager {
  p5: p5Types
  powerUps: PowerUp[]
  centerX: number
  centerY: number
  ringWidth: number
  ring: Ring | null
  powerUpPool: ObjectPool<PowerUp>

  constructor(p5: p5Types, centerX: number, ringWidth: number) {
    this.p5 = p5
    this.powerUps = []
    this.centerX = centerX
    this.centerY = p5.height / 2
    this.ringWidth = ringWidth
    this.ring = null
    
    // Inicializa o pool de power-ups
    this.powerUpPool = new ObjectPool<PowerUp>(
      // Factory function
      () => ({
        angle: 0,
        x: 0,
        y: 0,
        width: 30,
        height: 30,
        type: "shield", // Será atualizado durante o uso
        active: false,
        animation: 0,
        pulseFrequency: 1,
        rotationSpeed: 0,
        orbitRadius: 4,
        orbitPhase: 0,
        particleTimer: 0,
        glowSize: 1,
        glowOpacity: 0.6,
        trailPoints: []
      }),
      // Reset function
      (powerUp) => {
        powerUp.active = false;
        powerUp.trailPoints = [];
      },
      10, // Tamanho inicial do pool
      30  // Tamanho máximo do pool
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
    
    // Move os power-ups ao redor do anel
    for (const powerUp of this.powerUps) {
      // Move no sentido horário (diminui o ângulo)
      powerUp.angle -= gameSpeed * deltaTime * 0.01
      
      // Adiciona uma ligeira oscilação no movimento
      powerUp.angle += Math.sin(time * powerUp.pulseFrequency * 0.5) * 0.002;
      
      // Mantém o ângulo dentro de 0-2PI
      if (powerUp.angle < 0) {
        powerUp.angle += this.p5.TWO_PI
      }
      
      // Posição base no anel
      let baseX = 0, baseY = 0;
      if (this.ring) {
        const pos = this.ring.getPointOnRing(powerUp.angle)
        baseX = pos.x;
        baseY = pos.y;
        
        // Adiciona um movimento orbital ao redor da posição base
        const orbitAngle = time * 2 + powerUp.orbitPhase;
        
        // Calcula a direção do centro para o powerup
        const dirX = pos.x - this.centerX;
        const dirY = pos.y - this.centerY;
        const dist = Math.sqrt(dirX * dirX + dirY * dirY);
        
        // Normaliza o vetor de direção
        const normDirX = dirX / dist;
        const normDirY = dirY / dist;
        
        // Vetor perpendicular (para movimento orbital)
        const perpX = -normDirY;
        const perpY = normDirX;
        
        // Aplica movimento orbital
        const orbitX = Math.cos(orbitAngle) * perpX + Math.sin(orbitAngle) * normDirX;
        const orbitY = Math.cos(orbitAngle) * perpY + Math.sin(orbitAngle) * normDirY;
        
        powerUp.x = baseX + orbitX * powerUp.orbitRadius;
        powerUp.y = baseY + orbitY * powerUp.orbitRadius;
        
        // Atualiza a trilha com posições anteriores
        if (Math.random() < 0.2) { // Nem toda posição é registrada na trilha
          powerUp.trailPoints.unshift({
            x: powerUp.x,
            y: powerUp.y,
            age: 0,
            size: powerUp.width * 0.3 * Math.random()
          });
          
          // Limite o tamanho da trilha
          if (powerUp.trailPoints.length > 8) {
            powerUp.trailPoints.pop();
          }
        }
        
        // Atualiza a idade dos pontos da trilha
        for (let i = 0; i < powerUp.trailPoints.length; i++) {
          powerUp.trailPoints[i].age += deltaTime;
        }
      } else {
        powerUp.x = baseX;
        powerUp.y = baseY;
      }
      
      // Atualiza a animação principal com frequência personalizada
      powerUp.animation += deltaTime * 4 * powerUp.pulseFrequency
      if (powerUp.animation > this.p5.TWO_PI) {
        powerUp.animation -= this.p5.TWO_PI
      }
      
      // Timer para emissão de partículas
      powerUp.particleTimer -= deltaTime;
      if (powerUp.particleTimer <= 0) {
        powerUp.particleTimer = 0.2; // Tempo entre emissões
      }
      
      // Efeito de pulsação no brilho
      const glowPulse = Math.sin(time * 3 + powerUp.orbitPhase) * 0.2 + 0.8;
      powerUp.glowOpacity = (0.6 + Math.random() * 0.4) * glowPulse;
      
      // Remove power-ups que completaram uma volta
      if (powerUp.angle > this.p5.TWO_PI * 0.9 && powerUp.angle < this.p5.TWO_PI) {
        powerUp.active = false
      }
    }    // Identifica power-ups inativos
    const inactivePowerUps = this.powerUps.filter((pu) => !pu.active);
    
    // Devolve os power-ups inativos ao pool
    for (const powerUp of inactivePowerUps) {
      this.powerUpPool.release(powerUp);
    }
    
    // Remove power-ups inativos da lista ativa
    this.powerUps = this.powerUps.filter((pu) => pu.active)
  }

  draw(): void {
    const time = this.p5.millis() * 0.001;
    this.p5.push()

    for (const powerUp of this.powerUps) {
      if (!powerUp.active) continue

      // Desenha as trilhas primeiro (atrás do power-up)
      if (powerUp.trailPoints.length > 0) {
        for (let i = powerUp.trailPoints.length - 1; i >= 0; i--) {
          const point = powerUp.trailPoints[i];
          const lifeRatio = Math.min(1, point.age / 0.5); // Desaparece após 0.5 segundos
          
          // Cor baseada no tipo do power-up
          let r, g, b;
          switch (powerUp.type) {
            case "shield":
              r = 0; g = 150; b = 255;
              break;
            case "speed":
              r = 255; g = 200; b = 0;
              break;
            case "life":
              r = 255; g = 50; b = 100;
              break;
          }
          
          const alpha = 80 * (1 - lifeRatio);
          const size = point.size * (1 - lifeRatio * 0.5);
          
          this.p5.noStroke();
          this.p5.fill(r, g, b, alpha);
          this.p5.ellipse(point.x, point.y, size);
        }
      }

      // Desenha o glow externo (efeito de brilho)
      const glowPulse = 0.7 + Math.sin(time * 3 + powerUp.animation) * 0.3;
      switch (powerUp.type) {
        case "shield":
          this.p5.noStroke();
          this.p5.fill(0, 150, 255, 40 * powerUp.glowOpacity * glowPulse);
          this.p5.ellipse(powerUp.x, powerUp.y, powerUp.width * 2.5 * powerUp.glowSize, powerUp.height * 2.5 * powerUp.glowSize);
          this.p5.fill(0, 150, 255, 70 * powerUp.glowOpacity * glowPulse);
          this.p5.ellipse(powerUp.x, powerUp.y, powerUp.width * 1.8 * powerUp.glowSize, powerUp.height * 1.8 * powerUp.glowSize);
          break;
        case "speed":
          this.p5.noStroke();
          this.p5.fill(255, 200, 0, 40 * powerUp.glowOpacity * glowPulse);
          this.p5.ellipse(powerUp.x, powerUp.y, powerUp.width * 2.5 * powerUp.glowSize, powerUp.height * 2.5 * powerUp.glowSize);
          this.p5.fill(255, 200, 0, 70 * powerUp.glowOpacity * glowPulse);
          this.p5.ellipse(powerUp.x, powerUp.y, powerUp.width * 1.8 * powerUp.glowSize, powerUp.height * 1.8 * powerUp.glowSize);
          break;
        case "life":
          this.p5.noStroke();
          this.p5.fill(255, 50, 100, 40 * powerUp.glowOpacity * glowPulse);
          this.p5.ellipse(powerUp.x, powerUp.y, powerUp.width * 2.5 * powerUp.glowSize, powerUp.height * 2.5 * powerUp.glowSize);
          this.p5.fill(255, 50, 100, 70 * powerUp.glowOpacity * glowPulse);
          this.p5.ellipse(powerUp.x, powerUp.y, powerUp.width * 1.8 * powerUp.glowSize, powerUp.height * 1.8 * powerUp.glowSize);
          break;
      }
      
      // Salva o estado antes da rotação e translação
      this.p5.push()
      this.p5.translate(powerUp.x, powerUp.y)
      
      // Calcula a rotação para acompanhar o anel, mais rotação personalizada
      const angleToCenter = Math.atan2(powerUp.y - this.centerY, powerUp.x - this.centerX);
      const additionalRotation = time * powerUp.rotationSpeed;
      this.p5.rotate(angleToCenter + this.p5.PI/2 + additionalRotation);

      // Efeito de flutuação/pulsação com múltiplas frequências
      const primaryPulse = Math.sin(powerUp.animation) * 0.1;
      const secondaryPulse = Math.sin(time * 5) * 0.05;
      const scale = 1 + primaryPulse + secondaryPulse;
      this.p5.scale(scale)

      // Desenha com base no tipo
      switch (powerUp.type) {
        case "shield":
          // Camada externa animada
          this.p5.push();
          this.p5.rotate(time * 0.5); // Rotação lenta
          
          // Efeito de escudo hexagonal
          const shieldPoints = 6;
          const hexPulse = Math.sin(powerUp.animation * 0.5) * 0.1 + 1;
          
          // Efeito de escudo externo (animado)
          this.p5.stroke(0, 150, 255, 150);
          this.p5.strokeWeight(2);
          this.p5.fill(0, 150, 255, 50);
          
          this.p5.beginShape();
          for (let i = 0; i < shieldPoints; i++) {
            const angle = i * Math.PI * 2 / shieldPoints;
            const radius = powerUp.width * 0.6 * (1 + Math.sin(angle * 3 + time * 2) * 0.1) * hexPulse;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            this.p5.vertex(px, py);
          }
          this.p5.endShape(this.p5.CLOSE);
          
          // Escudo interior
          this.p5.rotate(Math.PI / shieldPoints); // Rotação do hexágono interno
          
          this.p5.stroke(100, 200, 255);
          this.p5.strokeWeight(1.5);
          this.p5.fill(0, 150, 255, 100);
          
          this.p5.beginShape();
          for (let i = 0; i < shieldPoints; i++) {
            const angle = i * Math.PI * 2 / shieldPoints;
            const radius = powerUp.width * 0.4;
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            this.p5.vertex(px, py);
          }
          this.p5.endShape(this.p5.CLOSE);
          
          // Núcleo central que pulsa
          this.p5.noStroke();
          const shieldCorePulse = 1 + Math.sin(time * 5) * 0.2;
          this.p5.fill(200, 230, 255, 200);
          this.p5.ellipse(0, 0, powerUp.width * 0.25 * shieldCorePulse);
          
          // Raios de energia emanando do centro
          this.p5.stroke(200, 230, 255, 150);
          this.p5.strokeWeight(1);
          for (let i = 0; i < 8; i++) {
            const rayAngle = i * Math.PI / 4 + time * 0.2;
            const innerRadius = powerUp.width * 0.15;
            const outerRadius = powerUp.width * 0.35;
            const ix = Math.cos(rayAngle) * innerRadius;
            const iy = Math.sin(rayAngle) * innerRadius;
            const ox = Math.cos(rayAngle) * outerRadius;
            const oy = Math.sin(rayAngle) * outerRadius;
            this.p5.line(ix, iy, ox, oy);
          }
          
          this.p5.pop();
          break;
          
        case "speed":
          // Velocidade (amarelo) com efeitos dinâmicos
          this.p5.push();
          
          // Rotação dinâmica
          this.p5.rotate(time * 2);
          
          // Rastro de velocidade (anéis concêntricos)
          for (let i = 3; i >= 0; i--) {
            const ringAlpha = 100 - i * 20;
            const ringSize = powerUp.width * (1.0 + i * 0.25);
            const ringPulse = Math.sin(time * 5 + i) * 0.1 + 1;
            
            this.p5.noFill();
            this.p5.stroke(255, 200, 0, ringAlpha);
            this.p5.strokeWeight(1);
            this.p5.ellipse(0, 0, ringSize * ringPulse, ringSize * ringPulse);
          }
          
          // Forma de estrela dinâmica 
          const points = 8;
          const outerRadius = powerUp.width * 0.5;
          const innerRadius = powerUp.width * 0.25;
          const waveEffect = Math.sin(time * 5) * 0.2;
          
          this.p5.noStroke();
          this.p5.fill(255, 200, 0);
          
          this.p5.beginShape();
          for (let i = 0; i < points * 2; i++) {
            const angle = (i / (points * 2)) * this.p5.TWO_PI;
            const radius = (i % 2 === 0) ? 
              outerRadius * (1 + (i/points) * waveEffect) : 
              innerRadius * (1 - (i/points) * waveEffect);
            const px = Math.cos(angle) * radius;
            const py = Math.sin(angle) * radius;
            this.p5.vertex(px, py);
          }
          this.p5.endShape(this.p5.CLOSE);
          
          // Círculo central pulsante
          const speedCorePulse = Math.sin(time * 8) * 0.2 + 1;
          const gradientSteps = 5;
          
          for (let j = gradientSteps; j >= 0; j--) {
            const ratio = j / gradientSteps;
            const size = powerUp.width * 0.3 * ratio * speedCorePulse;
            const alpha = 255 - ratio * 100;
            
            this.p5.fill(255, 255 - ratio * 55, 200 - ratio * 200, alpha);
            this.p5.ellipse(0, 0, size, size);
          }
          
          // Linhas de "velocidade" que saem do centro
          this.p5.stroke(255, 255, 150, 200);
          this.p5.strokeWeight(1.5);
          
          const speedLines = 16;
          for (let i = 0; i < speedLines; i++) {
            if (i % 2 === 0) continue; // Apenas metade das linhas
            
            const lineAngle = (i / speedLines) * this.p5.TWO_PI;
            const lineLength = powerUp.width * 0.15 + Math.sin(time * 10 + i) * 0.05;
            
            const startX = Math.cos(lineAngle) * (powerUp.width * 0.05);
            const startY = Math.sin(lineAngle) * (powerUp.width * 0.05);
            const endX = Math.cos(lineAngle) * (powerUp.width * 0.05 + lineLength);
            const endY = Math.sin(lineAngle) * (powerUp.width * 0.05 + lineLength);
            
            this.p5.line(startX, startY, endX, endY);
          }
          
          this.p5.pop();
          break;
          
        case "life":
          // Vida extra (vermelho/rosa) com animações aprimoradas
          this.p5.push();
          
          // Pequena rotação oscilante para o coração
          this.p5.rotate(Math.sin(time * 2) * 0.2);
          
          // Efeito de pulsação (como batimentos)
          const heartbeat = Math.pow(Math.sin(time * 4), 10); // Batida cardiaca mais acentuada
          const heartPulse = 1 + heartbeat * 0.2;
          this.p5.scale(heartPulse);
          
          // Aura ao redor do coração
          this.p5.noStroke();
          this.p5.fill(255, 50, 100, 50 + heartbeat * 70);
          
          // Forma de coração externa (aura)
          this.p5.beginShape();
          for (let a = 0; a < this.p5.TWO_PI; a += 0.1) {
            const r = powerUp.width/2 * 1.2 * (1 - Math.sin(a) * Math.sin(a) * Math.sin(a));
            const x = r * Math.cos(a);
            const y = -r * Math.sin(a) * 0.8;
            this.p5.vertex(x, y);
          }
          this.p5.endShape(this.p5.CLOSE);
          
          // Coração principal
          this.p5.fill(255, 50, 100);
          
          // Forma de coração principal com pequenas variações dinâmicas 
          this.p5.beginShape();
          for (let a = 0; a < this.p5.TWO_PI; a += 0.1) {
            // Pequena variação na forma durante a pulsação
            const waveEffect = Math.sin(a * 8 + time) * 0.05 * heartbeat;
            const r = powerUp.width/2 * (1 - Math.sin(a) * Math.sin(a) * Math.sin(a) * (1 + waveEffect));
            const x = r * Math.cos(a);
            const y = -r * Math.sin(a) * 0.8;
            this.p5.vertex(x, y);
          }
          this.p5.endShape(this.p5.CLOSE);
          
          // Gradiente interior do coração
          for (let i = 0; i < 3; i++) {
            const innerSize = 0.8 - i * 0.2;
            this.p5.fill(255, 50 + i * 40, 100 + i * 50, 180 - i * 40);
            
            // Forma de coração interior
            this.p5.beginShape();
            for (let a = 0; a < this.p5.TWO_PI; a += 0.15) {
              const r = powerUp.width/2 * innerSize * (1 - Math.sin(a) * Math.sin(a) * Math.sin(a));
              const x = r * Math.cos(a);
              const y = -r * Math.sin(a) * 0.8;
              this.p5.vertex(x, y);
            }
            this.p5.endShape(this.p5.CLOSE);
          }
          
          // Brilhos múltiplos
          const glowIntensity = 150 + heartbeat * 100;
          this.p5.fill(255, 200, 220, glowIntensity);
          this.p5.ellipse(-powerUp.width * 0.15, -powerUp.height * 0.2, powerUp.width * 0.2, powerUp.height * 0.2);
          this.p5.fill(255, 180, 200, glowIntensity * 0.7);
          this.p5.ellipse(powerUp.width * 0.1, -powerUp.height * 0.1, powerUp.width * 0.15, powerUp.height * 0.15);
          
          // Partículas de "energia vital" durante batimentos
          if (heartbeat > 0.5) {
            for (let i = 0; i < 3; i++) {
              const particleAngle = Math.random() * Math.PI * 2;
              const particleDist = powerUp.width * 0.3 * Math.random();
              const px = Math.cos(particleAngle) * particleDist;
              const py = Math.sin(particleAngle) * particleDist;
              const pSize = 1 + Math.random() * 2;
              
              this.p5.fill(255, 200, 220, 200);
              this.p5.ellipse(px, py, pSize, pSize);
            }
          }
          
          this.p5.pop();
          break
      }

      this.p5.pop()
    }

    this.p5.pop()
  }

  spawnPowerUp(angle: number = 0) {
    // Tipo aleatório com pesos diferentes para cada tipo
    const rand = Math.random()
    let type: "shield" | "speed" | "life"
    
    if (rand < 0.5) {
      type = "shield" // 50% de chance
    } else if (rand < 0.9) {
      type = "speed" // 40% de chance
    } else {
      type = "life" // 10% de chance
    }
    
    // Se não for fornecido um ângulo, gera um aleatório
    if (angle === 0) {
      angle = this.p5.random(this.p5.TWO_PI)
    }
    
    // Calcula a posição inicial
    let x = this.centerX
    let y = this.centerY
    
    if (this.ring) {
      const pos = this.ring.getPointOnRing(angle)
      x = pos.x
      y = pos.y
    }

    // Obtém um power-up do pool
    const powerUp = this.powerUpPool.get();
    if (powerUp) {
      powerUp.angle = angle;
      powerUp.x = x;
      powerUp.y = y;
      powerUp.width = 30;
      powerUp.height = 30;
      powerUp.type = type;
      powerUp.active = true;
      powerUp.animation = 0;
      powerUp.pulseFrequency = 1 + Math.random() * 2; // Frequência de pulsação única para cada power-up
      powerUp.rotationSpeed = (Math.random() - 0.5) * 2; // Velocidade e direção de rotação aleatória
      powerUp.orbitRadius = 4 + Math.random() * 6; // Raio da órbita das partículas
      powerUp.orbitPhase = Math.random() * Math.PI * 2; // Fase inicial da órbita
      powerUp.particleTimer = 0;
      powerUp.glowSize = 1.0 + Math.random() * 0.5; // Tamanho do brilho
      powerUp.glowOpacity = 0.6 + Math.random() * 0.4; // Opacidade do brilho
      powerUp.trailPoints = []; // Pontos da trilha

      this.powerUps.push(powerUp);
    }
  }

  getPowerUps(): PowerUp[] {
    return this.powerUps
  }
}
