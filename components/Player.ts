import type p5Types from "p5"
import { Ring } from "@/game/Ring"

export class Player {
  p5: p5Types
  x: number
  y: number
  width: number
  height: number
  velocityY: number
  gravity: number
  jumpForce: number
  isJumping: boolean
  isRunning: boolean
  hasShield: boolean
  hasSpeedBoost: boolean
  damageEffect: number
  animationFrame: number
  animationTimer: number
  groundY: number
  angle: number
  ring: Ring | null
  moveSpeed: number
  jumpHeight: number
  jumpDistance: number
  rotation: number
  isShooting: boolean
  shootCooldown: number
  lastShootTime: number

  constructor(p5: p5Types, x: number, y: number) {
    this.p5 = p5
    this.x = x
    this.y = y
    this.width = 40
    this.height = 60
    this.velocityY = 0
    this.gravity = 30
    this.jumpForce = -15
    this.isJumping = false
    this.isRunning = true
    this.hasShield = false
    this.hasSpeedBoost = false
    this.damageEffect = 0
    this.animationFrame = 0
    this.animationTimer = 0
    this.groundY = y
    
    // Novos atributos para o movimento orbital
    this.angle = Math.PI; // Começa na parte inferior do anel
    this.ring = null
    this.moveSpeed = 0.05
    this.jumpHeight = 0
    this.jumpDistance = 0
    this.rotation = 0
    
    // Atributos para o sistema de tiro
    this.isShooting = false
    this.shootCooldown = 0.5 // Tempo em segundos entre tiros
    this.lastShootTime = 0
  }

  setRing(ring: Ring) {
    this.ring = ring
    this.angle = Math.PI // Começa na parte inferior do anel
    const pos = ring.getPointOnRing(this.angle)
    this.x = pos.x
    this.y = pos.y
  }
  
  update(controls: {left: boolean, right: boolean, jump: boolean, shoot: boolean}, deltaTime: number, gameTime: number) {
    if (!this.ring) return;
    
    // Atualiza o timer de animação com velocidade variável baseada na velocidade
    const animSpeed = this.hasSpeedBoost ? 0.05 : 0.08;
    this.animationTimer += deltaTime * (1 + (this.isRunning ? 0.5 : 0))
    if (this.animationTimer >= animSpeed) {
      // Muda o frame com velocidade adaptativa
      this.animationFrame = (this.animationFrame + 1) % 8 // Aumenta o número de frames para animação mais suave
      this.animationTimer = 0
    }
    
    // Movimento orbital
    let direction = 0
    if (controls.left) direction -= 1
    if (controls.right) direction += 1
    
    // Aplica o movimento ao longo do anel
    if (direction !== 0) {
      const moveSpeed = this.hasSpeedBoost ? this.moveSpeed * 1.5 : this.moveSpeed
      this.angle = this.ring.movePlayer(this.angle, direction, moveSpeed * deltaTime * 60)
    }
    
    // Verifica se o jogador está atirando
    this.isShooting = controls.shoot && (gameTime - this.lastShootTime > this.shootCooldown)
    
    // Lida com o pulo
    if (controls.jump && !this.isJumping) {
      this.isJumping = true
      this.jumpHeight = 0
      this.velocityY = this.jumpForce
    }

    // Aplica gravidade ao pulo
    if (this.isJumping) {
      this.jumpHeight += this.velocityY * deltaTime
      this.velocityY += this.gravity * deltaTime
      
      // Verifica se o pulo terminou
      if (this.jumpHeight >= 0) {
        this.jumpHeight = 0
        this.isJumping = false
        this.velocityY = 0
      }
    }
    
    // Atualiza a posição com base no ângulo
    const basePos = this.ring.getPointOnRing(this.angle)
    
    // Calcula a direção normal ao anel (para o pulo)
    const normalX = basePos.x - this.ring.centerX
    const normalY = basePos.y - this.ring.centerY
    const normalLength = Math.sqrt(normalX * normalX + normalY * normalY)
    const normalizedX = normalX / normalLength
    const normalizedY = normalY / normalLength
    
    // Aplica o pulo na direção normal
    this.x = basePos.x - normalizedX * this.jumpHeight * 2
    this.y = basePos.y - normalizedY * this.jumpHeight * 2
    
    // Atualiza a rotação do personagem para acompanhar o anel
    this.rotation = Math.atan2(normalizedY, normalizedX) + Math.PI/2
    
    // Atualiza o status de corrida
    this.isRunning = !this.isJumping && (controls.left || controls.right)
    
    // Reduz o efeito de dano gradualmente
    if (this.damageEffect > 0) {
      this.damageEffect -= deltaTime * 2
    }
  }

  draw() {
    this.p5.push()
    
    // Aplica rotação para que o personagem fique alinhado ao anel com um leve efeito de inclinação na curva
    this.p5.translate(this.x, this.y)
    
    // Adiciona um leve efeito de balanço quando está se movendo
    const tiltAmount = this.isRunning ? Math.sin(this.p5.millis() * 0.01) * 0.05 : 0;
    this.p5.rotate(this.rotation + tiltAmount)
    
    // Desenha escudo se ativo com animação de rotação e pulsação
    if (this.hasShield) {
      const shieldPulse = 1 + Math.sin(this.p5.millis() * 0.005) * 0.1;
      const shieldRotation = this.p5.millis() * 0.001;
      
      // Escudo externo rotativo
      this.p5.push();
      this.p5.rotate(shieldRotation);
      this.p5.stroke(0, 200, 255, 200 + Math.sin(this.p5.millis() * 0.01) * 55)
      this.p5.strokeWeight(2 + Math.sin(this.p5.millis() * 0.02) * 1)
      this.p5.fill(0, 200, 255, 30 + Math.sin(this.p5.millis() * 0.008) * 20)
      this.p5.ellipse(0, 0, this.width * 2 * shieldPulse, this.height * 1.5 * shieldPulse)
      
      // Padrão de energia no escudo
      for (let i = 0; i < 8; i++) {
        const arcStart = (i / 8) * this.p5.TWO_PI + this.p5.millis() * 0.002;
        const arcEnd = arcStart + this.p5.PI/8;
        this.p5.noFill();
        this.p5.strokeWeight(1);
        this.p5.stroke(100, 230, 255, 150);
        this.p5.arc(0, 0, this.width * 2.1 * shieldPulse, this.height * 1.6 * shieldPulse, 
                    arcStart, arcEnd);
      }
      this.p5.pop();
      
      // Partículas do escudo
      for (let i = 0; i < 5; i++) {
        const particleAngle = this.p5.random(this.p5.TWO_PI);
        const dist = this.width * (0.9 + this.p5.random(0.2));
        const particleX = Math.cos(particleAngle) * dist;
        const particleY = Math.sin(particleAngle) * dist;
        const particleSize = 2 + this.p5.random(3);
        
        this.p5.fill(100, 230, 255, 150);
        this.p5.noStroke();
        this.p5.ellipse(particleX, particleY, particleSize, particleSize);
      }
    }
    
    // Desenha efeito de velocidade se ativo
    if (this.hasSpeedBoost) {
      this.p5.noStroke()

      // Trilha de velocidade com cores dinâmicas
      for (let i = 1; i <= 8; i++) {
        // Cores que variam para criar efeito de fogo/energia
        const hue = (this.p5.millis() * 0.05 + i * 30) % 100;
        const brightness = 100 - i * 10;
        
        this.p5.fill(255, 200 - i * 15, 0, 150 - i * 10)
        
        // Padrão mais dinâmico e aleatório para a trilha
        const trailWidth = this.width * (1 - i * 0.08) * (0.8 + Math.sin(this.p5.millis() * 0.01 + i) * 0.2);
        const trailHeight = this.height * (1 - i * 0.08) * (0.7 + Math.sin(this.p5.millis() * 0.02 + i) * 0.3);
        
        // Movimento ondulado da trilha
        const waveX = Math.sin(this.p5.millis() * 0.01 + i * 0.5) * (i * 1.5);
        const waveY = Math.cos(this.p5.millis() * 0.008 + i * 0.5) * (i * 1);
        
        this.p5.ellipse(-i * 8 + waveX, waveY, trailWidth, trailHeight);
        
        // Partículas de energia adicionais
        if (i > 4 && i % 2 === 0) {
          for (let j = 0; j < 2; j++) {
            const sparkX = -i * 8 + this.p5.random(-10, 5);
            const sparkY = this.p5.random(-10, 10);
            const sparkSize = this.p5.random(2, 5);
            this.p5.fill(255, 255, 100, 100);
            this.p5.ellipse(sparkX, sparkY, sparkSize, sparkSize);
          }
        }
      }
    }
    
    // Efeito de dano com gradiente e flash mais natural
    if (this.damageEffect > 0) {
      const flashIntensity = Math.sin(this.damageEffect * 20) * 0.5 + 0.5;
      this.p5.fill(255, 70 + (150 * flashIntensity), 70 + (100 * flashIntensity))
    } else {
      // Cor normal com leve variação para parecer mais vivo
      const colorPulse = Math.sin(this.p5.millis() * 0.0015) * 10;
      this.p5.fill(220 + colorPulse, 220 + colorPulse, 255)
    }

    // Desenha o astronauta
    this.p5.noStroke();
    
    // Corpo do traje espacial
    this.p5.rect(0, 0, this.width, this.height, 10);
    
    // Mochila jetpack
    this.p5.fill(150, 150, 180);
    this.p5.rect(0, 5, this.width * 0.7, this.height * 0.6, 5);
    
    // Capacete
    this.p5.fill(200, 200, 230);
    this.p5.ellipse(0, -this.height/2 + 15, this.width * 0.9, this.width * 0.9);
    
    // Viseira do capacete
    this.p5.fill(100, 200, 255, 150);
    this.p5.arc(0, -this.height/2 + 15, this.width * 0.7, this.width * 0.7, -this.p5.PI * 0.7, this.p5.PI * 0.7, this.p5.CHORD);
    
    // Luzes do traje
    this.p5.fill(0, 255, 255);
    this.p5.rect(-this.width/3, 0, 4, 8, 2);
    this.p5.rect(this.width/3, 0, 4, 8, 2);
    
    // Pernas/botas com animação mais fluida
    this.p5.fill(180, 180, 210);
    if (this.isRunning) {
      // Animação de corrida com movimento mais natural
      const cycleOffset = (this.animationFrame / 8) * this.p5.TWO_PI;
      const legOffset1 = Math.sin(cycleOffset) * 12;
      const legOffset2 = Math.sin(cycleOffset + this.p5.PI) * 12;
      
      // Perna esquerda com forma de bota
      this.p5.push();
      this.p5.translate(-this.width/4, this.height/2 - 5 + legOffset1);
      this.p5.rotate(legOffset1 * 0.05);
      this.p5.ellipse(0, 0, 12, 15);
      // Adiciona detalhe da bota
      this.p5.fill(150, 150, 180);
      this.p5.rect(-4, 2, 8, 8, 2);
      this.p5.pop();
      
      // Perna direita
      this.p5.push();
      this.p5.translate(this.width/4, this.height/2 - 5 + legOffset2);
      this.p5.rotate(legOffset2 * 0.05);
      this.p5.ellipse(0, 0, 12, 15);
      // Adiciona detalhe da bota
      this.p5.fill(150, 150, 180);
      this.p5.rect(-4, 2, 8, 8, 2);
      this.p5.pop();
    } else {
      // Posição padrão ou pulo com leve movimento mesmo em posição estática
      const idleWobble = Math.sin(this.p5.millis() * 0.002) * 2;
      
      this.p5.push();
      this.p5.translate(-this.width/4, this.height/2 - 5 + idleWobble);
      this.p5.ellipse(0, 0, 12, 15);
      this.p5.fill(150, 150, 180);
      this.p5.rect(-4, 2, 8, 8, 2);
      this.p5.pop();
      
      this.p5.push();
      this.p5.translate(this.width/4, this.height/2 - 5 - idleWobble);
      this.p5.ellipse(0, 0, 12, 15);
      this.p5.fill(150, 150, 180);
      this.p5.rect(-4, 2, 8, 8, 2);
      this.p5.pop();
    }

    // Braços com animação mais dinâmica
    this.p5.fill(180, 180, 210);
    if (this.isJumping) {
      // Animação pulsante para os braços durante o pulo
      const jumpWave = Math.sin(this.p5.millis() * 0.01) * 3;
      
      // Braços estendidos para o pulo
      this.p5.push();
      this.p5.translate(-this.width/2 + 5, -this.height/4 + jumpWave);
      this.p5.rotate(-0.3 + jumpWave * 0.02);
      this.p5.ellipse(0, 0, 10, 10);
      // Adiciona luvas
      this.p5.fill(150, 150, 180);
      this.p5.ellipse(4, 0, 6, 6);
      this.p5.pop();
      
      this.p5.push();
      this.p5.translate(this.width/2 - 5, -this.height/4 - jumpWave);
      this.p5.rotate(0.3 - jumpWave * 0.02);
      this.p5.ellipse(0, 0, 10, 10);
      // Adiciona luvas
      this.p5.fill(150, 150, 180);
      this.p5.ellipse(-4, 0, 6, 6);
      this.p5.pop();
      
      // Chamas do jetpack com animação dinâmica
      const flameTime = this.p5.millis() * 0.01;
      const flameHeight = 20 + Math.sin(flameTime) * 5;
      const flameWidth = this.width/4 + Math.sin(flameTime * 0.7) * 2;
      
      // Camada externa da chama
      for (let i = 0; i < 3; i++) {
        const flicker = Math.sin(flameTime + i) * 3;
        this.p5.fill(255, 150 - i * 30, 50 - i * 15, 200 - i * 30);
        this.p5.beginShape();
        this.p5.vertex(-flameWidth + flicker, this.height/2);
        this.p5.vertex(-flameWidth/2 + flicker/2, this.height/2 + flameHeight/2);
        this.p5.vertex(0, this.height + flameHeight + flicker);
        this.p5.vertex(flameWidth/2 - flicker/2, this.height/2 + flameHeight/2);
        this.p5.vertex(flameWidth - flicker, this.height/2);
        this.p5.endShape(this.p5.CLOSE);
      }
      
      // Camada interna da chama (mais brilhante)
      this.p5.fill(255, 220, 100);
      const innerFlicker = Math.sin(flameTime * 1.5) * 2;
      const innerWidth = flameWidth * 0.6;
      const innerHeight = flameHeight * 0.7;
      
      this.p5.beginShape();
      this.p5.vertex(-innerWidth + innerFlicker, this.height/2);
      this.p5.vertex(-innerWidth/2, this.height/2 + innerHeight/2);
      this.p5.vertex(0, this.height + innerHeight);
      this.p5.vertex(innerWidth/2, this.height/2 + innerHeight/2);
      this.p5.vertex(innerWidth - innerFlicker, this.height/2);
      this.p5.endShape(this.p5.CLOSE);
      
      // Adiciona partículas de faísca na chama
      for (let i = 0; i < 3; i++) {
        const sparkX = this.p5.random(-innerWidth, innerWidth);
        const sparkY = this.p5.random(this.height/2, this.height + innerHeight);
        const sparkSize = this.p5.random(1, 4);
        this.p5.fill(255, 255, 200);
        this.p5.ellipse(sparkX, sparkY, sparkSize, sparkSize);
      }
    } else {
      // Braços balançando durante a corrida com movimento mais orgânico
      const cycleProgress = (this.animationFrame / 8) * this.p5.TWO_PI;
      const armOffset1 = Math.cos(cycleProgress) * 12;
      const armOffset2 = Math.cos(cycleProgress + this.p5.PI) * 12;
      
      // Animação de rotação/balanço dos braços
      
      // Braço esquerdo
      this.p5.push();
      this.p5.translate(-this.width/2 + 5, -this.height/4 + armOffset1/2);
      this.p5.rotate(armOffset1 * 0.03);
      this.p5.ellipse(0, 0, 10, 10);
      // Adiciona luvas
      this.p5.fill(150, 150, 180);
      this.p5.ellipse(4, 0, 6, 6);
      this.p5.pop();
      
      // Braço direito
      this.p5.push();
      this.p5.translate(this.width/2 - 5, -this.height/4 - armOffset2/2);
      this.p5.rotate(-armOffset2 * 0.03);
      this.p5.ellipse(0, 0, 10, 10);
      // Adiciona luvas
      this.p5.fill(150, 150, 180);
      this.p5.ellipse(-4, 0, 6, 6);
      this.p5.pop();
      
      // Efeito de poeira/velocidade nas botas quando correndo
      if (this.isRunning) {
        this.p5.noStroke();
        
        // Sistema de partículas mais complexo para a poeira
        for (let i = 0; i < 3; i++) {
          const baseAlpha = 150 - i * 40;
          const alpha = this.hasSpeedBoost ? baseAlpha + 50 : baseAlpha;
          
          // Cores variáveis com base na velocidade
          if (this.hasSpeedBoost) {
            // Partículas de fogo/energia para boost
            const hueShift = Math.sin(this.p5.millis() * 0.001 + i) * 30;
            this.p5.fill(255, 180 + hueShift, 100, alpha);
          } else {
            // Poeira normal
            this.p5.fill(255, 255, 200, alpha);
          }
          
          // Tamanho variável baseado na animação e posição
          const phase = (this.animationFrame / 8) * this.p5.TWO_PI + i * this.p5.PI/4;
          const dustSizeBase = 5 + Math.sin(phase) * 3;
          const dustWidth = dustSizeBase * (1 + i * 0.5);
          const dustHeight = dustSizeBase * 0.6;
          
          // Offset variável para criar efeito mais natural
          const offsetX = -i * 5 + Math.sin(phase + i) * 2;
          const offsetY = Math.sin(phase * 0.7) * 2;
          
          // Perna esquerda - poeira
          this.p5.ellipse(-this.width/4 + offsetX, this.height/2 + 8 + offsetY, 
                         dustWidth, dustHeight);
          
          // Perna direita - poeira
          this.p5.ellipse(this.width/4 + offsetX, this.height/2 + 8 + offsetY, 
                        dustWidth, dustHeight);
        }
        
        // Adiciona partículas extras durante o speed boost
        if (this.hasSpeedBoost) {
          for (let i = 0; i < 4; i++) {
            const sparkX = this.p5.random(-this.width/2, this.width/2);
            const sparkY = this.height/2 + this.p5.random(5, 15);
            const sparkSize = this.p5.random(1, 4);
            this.p5.fill(255, 255, 150, 180);
            this.p5.ellipse(sparkX, sparkY, sparkSize, sparkSize);
          }
        }
      }
    }

    // Detalhes da viseira/capacete com efeitos melhorados
    // Efeito de tecnologia na viseira
    this.p5.push();
    
    // Reflexo dinâmico na viseira
    this.p5.fill(255, 255, 255, 100);
    this.p5.noStroke();
    const reflectionSize = this.width * (0.3 + Math.sin(this.p5.millis() * 0.002) * 0.05);
    const reflectionPosition = -this.p5.PI * (0.25 + Math.sin(this.p5.millis() * 0.001) * 0.1);
    this.p5.arc(0, -this.height/2 + 15, reflectionSize, reflectionSize, 
              reflectionPosition - 0.3, reflectionPosition + 0.3);
    
    // Efeito de HUD/display na viseira
    if (this.isShooting || this.hasSpeedBoost) {
      this.p5.noFill();
      this.p5.stroke(100, 200, 255, 80);
      this.p5.strokeWeight(1);
      
      // Pequenos elementos gráficos simulando um HUD
      const hudY = -this.height/2 + 15;
      const hudSize = this.width * 0.25;
      
      // Círculo alvo quando atirando
      if (this.isShooting) {
        this.p5.ellipse(hudSize * 0.3, hudY, hudSize * 0.25, hudSize * 0.25);
        this.p5.line(hudSize * 0.2, hudY, hudSize * 0.4, hudY);
        this.p5.line(hudSize * 0.3, hudY - hudSize * 0.1, hudSize * 0.3, hudY + hudSize * 0.1);
      }
      
      // Indicador de velocidade
      if (this.hasSpeedBoost) {
        const speedBarWidth = hudSize * 0.5;
        const speedBarHeight = hudSize * 0.08;
        const barFill = Math.sin(this.p5.millis() * 0.01) * 0.25 + 0.75;
        
        this.p5.stroke(100, 200, 255, 50);
        this.p5.rect(-speedBarWidth/2, hudY + hudSize * 0.2, speedBarWidth, speedBarHeight);
        
        this.p5.noStroke();
        this.p5.fill(100, 255, 200, 70);
        this.p5.rect(-speedBarWidth/2, hudY + hudSize * 0.2, speedBarWidth * barFill, speedBarHeight);
      }
    }
    
    // Detalhes do capacete com iluminação
    const helmetLight = Math.sin(this.p5.millis() * 0.002) * 20;
    
    // Detalhes laterais do capacete
    this.p5.noStroke();
    this.p5.fill(150 + helmetLight, 150 + helmetLight, 180 + helmetLight);
    this.p5.ellipse(-this.width * 0.35, -this.height/2 + 15, this.width * 0.15, this.width * 0.2);
    this.p5.ellipse(this.width * 0.35, -this.height/2 + 15, this.width * 0.15, this.width * 0.2);
    
    // Antena do capacete com animação
    const antennaWave = Math.sin(this.p5.millis() * 0.004) * 1;
    this.p5.stroke(150, 150, 180);
    this.p5.strokeWeight(2);
    this.p5.line(0, -this.height/2, antennaWave, -this.height/2 - 15);
    
    // Luz piscante da antena
    const blinkRate = Math.sin(this.p5.millis() * 0.01);
    const blinkAlpha = blinkRate > 0 ? 255 : 100;
    const blinkSize = 3 + blinkRate * 2;
    
    this.p5.noStroke();
    this.p5.fill(255, 50, 50, blinkAlpha);
    this.p5.ellipse(antennaWave, -this.height/2 - 15, blinkSize, blinkSize);
    
    // Brilho ao redor da luz da antena
    this.p5.fill(255, 50, 50, 50);
    this.p5.ellipse(antennaWave, -this.height/2 - 15, blinkSize * 2, blinkSize * 2);
    
    this.p5.pop();
    
    // Efeito de tiro se estiver atirando
    if (this.isShooting) {
      // Desenha um brilho na direção do tiro
      const shootDir = this.getShootDirection();
      const glowStart = 20;
      const glowEnd = 50;
      
      this.p5.noStroke();
      
      // Gradiente de brilho
      for (let i = 0; i < 5; i++) {
        const alpha = 150 - i * 30;
        const width = 15 - i * 2;
        this.p5.fill(100, 200, 255, alpha);
        this.p5.beginShape();
        this.p5.vertex(shootDir.x * glowStart, shootDir.y * glowStart);
        this.p5.vertex(shootDir.y * width, -shootDir.x * width);
        this.p5.vertex(shootDir.x * glowEnd, shootDir.y * glowEnd);
        this.p5.vertex(-shootDir.y * width, shootDir.x * width);
        this.p5.endShape(this.p5.CLOSE);
      }
    }

    this.p5.pop()
  }

  jump() {
    if (!this.isJumping) {
      this.velocityY = this.jumpForce
      this.isJumping = true
      this.isRunning = false
    }
  }

  getHitbox() {
    return {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
      width: this.width,
      height: this.height,
    }
  }

  showDamageEffect() {
    this.damageEffect = 1
  }

  setPosition(x: number, y: number) {
    this.x = x
    this.y = y
    this.groundY = y
  }
  
  canShoot(gameTime: number) {
    return gameTime - this.lastShootTime > this.shootCooldown;
  }
  
  shoot(gameTime: number) {
    if (this.canShoot(gameTime)) {
      this.lastShootTime = gameTime;
      this.isShooting = false;
      return true;
    }
    return false;
  }
  
  getShootDirection() {
    if (!this.ring) return { x: 0, y: 0 };
    
    // Calcula a direção do tiro em direção ao centro do planeta
    const dirX = this.ring.centerX - this.x;
    const dirY = this.ring.centerY - this.y;
    
    // Normaliza o vetor de direção
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    
    return {
      x: dirX / length,
      y: dirY / length
    };
  }
}
