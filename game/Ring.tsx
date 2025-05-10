import type p5Types from "p5"

export class Ring {
  p5: p5Types
  centerX: number
  centerY: number
  innerRadius: number
  outerRadius: number
  segments: number
  segmentColors: Array<{ r: number; g: number; b: number }>
  rotation: number
  rotationSpeed: number
  planetRadius: number
  playerAngle: number
  coreVisible: boolean
  coreBlinkTimer: number
  coreBlinkInterval: number
  coreAngle: number
  coreSize: number
  coreActive: boolean
  coreHitCount: number
  coreMaxHits: number

  constructor(p5: p5Types, centerX: number, centerY: number) {
    this.p5 = p5
    this.centerX = centerX
    this.centerY = centerY

    // Ring dimensions
    const minDimension = this.p5.min(p5.width, p5.height)
    this.outerRadius = minDimension * 0.4
    this.innerRadius = minDimension * 0.3
    
    // Rotação e velocidade orbital com variação para mais dinamismo
    this.rotation = 0
    this.rotationSpeed = 0.005 + this.p5.random(-0.001, 0.001) // Pequena variação na velocidade base
    
    // Saturno (planeta no centro)
    this.planetRadius = minDimension * 0.25
    
    // Ângulo do jogador no anel (em radianos)
    this.playerAngle = 0
    
    // Propriedades do núcleo do planeta que deve ser atingido
    this.coreVisible = false
    this.coreBlinkTimer = 0
    this.coreBlinkInterval = 0.3 + this.p5.random(0, 0.4) // Intervalo variável de piscada
    this.coreAngle = this.p5.random(this.p5.TWO_PI) // Posição aleatória no núcleo
    this.coreSize = minDimension * (0.05 + this.p5.random(0.02)) // Tamanho levemente variável
    this.coreActive = true
    this.coreHitCount = 0
    this.coreMaxHits = 3 // Número de acertos necessários

    // Segments for visual effect
    this.segments = 12
    this.segmentColors = []

    // Generate segment colors with more variety and patterns
    for (let i = 0; i < this.segments; i++) {
      // Posição no círculo (0 a 1)
      const position = i / this.segments;
      
      // Cria padrões alternados de cores usando funções senoidais
      const pattern = Math.sin(position * Math.PI * 4); // 4 repetições ao redor do anel
      
      // Diferentes esquemas de cores para criar bandas visíveis
      let r, g, b;
      
      if (pattern > 0.3) {
        // Bandas douradas
        r = this.p5.random(200, 230);
        g = this.p5.random(180, 210);
        b = this.p5.random(100, 130);
      } else if (pattern < -0.3) {
        // Bandas acinzentadas
        const gray = this.p5.random(160, 200);
        r = gray;
        g = gray;
        b = this.p5.random(gray * 0.7, gray * 0.9);
      } else {
        // Bandas de transição
        r = this.p5.random(180, 220);
        g = this.p5.random(170, 200);
        b = this.p5.random(120, 160);
      }
      
      this.segmentColors.push({ r, g, b })
    }
  }
  update(deltaTime: number): void {
    // Atualiza a rotação do anel com velocidade variável
    const time = this.p5.millis() * 0.001;
    
    // Velocidade que flutua suavemente com várias frequências sobrepostas
    const speedVariation = 
      Math.sin(time * 0.5) * 0.0007 + 
      Math.sin(time * 0.2) * 0.0005 +
      Math.sin(time * 1.5) * 0.0003;
      
    this.rotation += (this.rotationSpeed + speedVariation) * deltaTime * 60;
    
    // Mantém a rotação dentro de 0 a TWO_PI
    if (this.rotation >= this.p5.TWO_PI) {
      this.rotation -= this.p5.TWO_PI;
    }
    
    // Atualiza o timer de piscagem do núcleo com intervalo dinâmico que varia com o dano
    this.coreBlinkTimer += deltaTime;
    
    // Modifica gradualmente o intervalo de piscada baseado no número de acertos
    const urgencyFactor = 1 - (this.coreHitCount / this.coreMaxHits) * 0.5;
    const currentInterval = this.coreBlinkInterval * urgencyFactor;
    
    if (this.coreBlinkTimer >= currentInterval) {
      this.coreBlinkTimer = 0;
      this.coreVisible = !this.coreVisible;
      
      // Se o núcleo estiver ativo, pequena chance de mudar sua posição para adicionar desafio
      if (this.coreActive && this.coreHitCount > 0 && this.p5.random(1) < 0.1) {
        // Movimenta o núcleo de forma gradual, não completamente aleatória
        this.coreAngle = (this.coreAngle + this.p5.random(-Math.PI/4, Math.PI/4)) % this.p5.TWO_PI;
        if (this.coreAngle < 0) this.coreAngle += this.p5.TWO_PI;
      }
      
      // Se o núcleo não estiver ativo, gera uma nova posição para ele após alguns segundos
      if (!this.coreActive && this.p5.random(1) < 0.2) {
        this.coreActive = true;
        this.coreAngle = this.p5.random(this.p5.TWO_PI);
        // Redefine o tamanho do núcleo com variação
        this.coreSize = this.planetRadius * (0.2 + this.p5.random(0.05));
        // Novo intervalo de piscada
        this.coreBlinkInterval = 0.3 + this.p5.random(0, 0.4);
      }
    }
  }
  draw(): void {
    const time = this.p5.millis() * 0.001;
    
    this.p5.push()
    this.p5.translate(this.centerX, this.centerY)
    this.p5.rotate(this.rotation)

    // Draw ring segments with enhanced effects
    for (let i = 0; i < this.segments; i++) {
      const startAngle = (i / this.segments) * this.p5.TWO_PI
      const endAngle = ((i + 1) / this.segments) * this.p5.TWO_PI

      // Aplica uma pulsação leve aos segmentos
      const segmentPulse = 1 + Math.sin(time * 0.5 + i * 0.3) * 0.02;
      
      // Aplica uma oscilação lateral aos segmentos
      const segmentWobble = Math.sin(time * 0.3 + i * 0.5) * 0.01;
      
      const color = this.segmentColors[i]
      
      // Efeito de brilho pulsante em segmentos aleatórios
      const glowEffect = Math.sin(time * 0.7 + i * 1.2);
      let glowIntensity = 0;
      
      // Apenas alguns segmentos piscam
      if (i % 3 === 0) {
        glowIntensity = Math.max(0, glowEffect) * 30;
      }
      
      // Desenha o segmento externo com glow dinâmico
      this.p5.fill(
        Math.min(255, color.r + glowIntensity), 
        Math.min(255, color.g + glowIntensity), 
        Math.min(255, color.b + glowIntensity), 
        200
      )
      this.p5.stroke(color.r * 0.8, color.g * 0.8, color.b * 0.8)
      this.p5.strokeWeight(1)

      // Desenha os arcos externos com tamanho dinâmico
      const outerSize = this.outerRadius * 2 * segmentPulse;
      const outerSqueeze = 1 + segmentWobble;
      this.p5.arc(0, 0, outerSize * outerSqueeze, outerSize / outerSqueeze, 
                  startAngle, endAngle, this.p5.PIE)
                  
      // Parte interna do anel (buraco)
      this.p5.fill(0)
      const innerSize = this.innerRadius * 2 * segmentPulse;
      const innerSqueeze = 1 - segmentWobble * 0.5; // Efeito de squeeze invertido para o círculo interno
      this.p5.arc(0, 0, innerSize * innerSqueeze, innerSize / innerSqueeze,
                 startAngle, endAngle, this.p5.PIE)
      
      // Adiciona partículas brilhantes no anel para alguns segmentos
      if (Math.random() < 0.05) {
        const particleAngle = this.p5.random(startAngle, endAngle);
        const particleRadius = this.p5.random(this.innerRadius, this.outerRadius);
        const particleX = particleRadius * Math.cos(particleAngle);
        const particleY = particleRadius * Math.sin(particleAngle);
        const particleSize = this.p5.random(1, 3);
        
        this.p5.fill(255, 255, 200, 150);
        this.p5.noStroke();
        this.p5.ellipse(particleX, particleY, particleSize, particleSize);
      }
    }
    
    // Desenha o planeta Saturno com efeitos melhorados
    // Gradiente para simular iluminação
    const gradientRadius = this.planetRadius * 2;
    
    // Cria um gradiente manual para o planeta
    for (let r = 0; r < 10; r++) {
      const ratio = r / 10;
      const shade = 1 - ratio * 0.3;
      const offset = Math.sin(time * 0.5) * 5; // Leve movimento na iluminação
      
      // Cores Base de Saturno
      const baseR = 210;
      const baseG = 180;
      const baseB = 140;
      
      this.p5.fill(baseR * shade, baseG * shade, baseB * shade);
      this.p5.noStroke();
      
      // Efeito de atmosfera pulsante
      const atmospherePulse = 1 + Math.sin(time * 0.2) * 0.01;
      const planetSize = (gradientRadius - r * (gradientRadius/10)) * atmospherePulse;
      
      this.p5.ellipse(offset * ratio, 0, planetSize, planetSize * 0.95); // Leve achatamento nos polos
    }
    
    // Adiciona textura ao planeta - bandas atmosféricas dinâmicas
    for (let i = 0; i < 7; i++) {
      const bandOffset = Math.sin(time * 0.3 + i * 0.5) * 3;
      const bandY = (i - 3) * (this.planetRadius / 4);
      
      const bandWidth = this.planetRadius * 2 * 0.9;
      const bandHeight = this.planetRadius * 0.15 + Math.sin(time * 0.2 + i) * 2;
      
      this.p5.noFill();
      this.p5.stroke(180, 150, 120, 70);
      this.p5.strokeWeight(1);
      this.p5.ellipse(bandOffset, bandY, bandWidth, bandHeight);
    }
    
    // Adiciona nuvens/tempestades na superfície
    for (let i = 0; i < 5; i++) {
      const stormAngle = time * 0.1 + i * 1.2;
      const stormRadius = this.planetRadius * 0.7;
      const stormX = stormRadius * Math.cos(stormAngle);
      const stormY = stormRadius * Math.sin(stormAngle) * 0.5; // Achatado para ficar na superfície visível
      
      // Tamanho variável para as tempestades
      const stormSize = 5 + Math.sin(time * 0.5 + i) * 2;
      
      this.p5.noStroke();
      this.p5.fill(230, 200, 160, 150);
      this.p5.ellipse(stormX, stormY, stormSize, stormSize * 0.8);
    }
    
    // Desenha o núcleo do planeta que deve ser atingido (quando ativo e visível)
    if (this.coreActive) {
      // Calcula a posição do núcleo dentro do planeta
      const wobble = Math.sin(this.p5.millis() * 0.003) * 5; // Efeito de wobble no núcleo
      const coreDistance = this.planetRadius * (0.6 + Math.sin(this.p5.millis() * 0.0015) * 0.05); // Distância variável
      const coreX = coreDistance * Math.cos(this.coreAngle) + wobble * Math.cos(this.p5.millis() * 0.001);
      const coreY = coreDistance * Math.sin(this.coreAngle) + wobble * Math.sin(this.p5.millis() * 0.001);
      
      // Efeito de energia crescente baseado no número de acertos
      const energyLevel = this.coreHitCount / this.coreMaxHits;
      
      // Só desenha o core se estiver visível ou se já tiver tomado dano (nesse caso pisca mais rápido)
      if (this.coreVisible || (energyLevel > 0 && Math.sin(this.p5.millis() * 0.02) > 0)) {
        // Desenha o brilho externo do núcleo
        this.p5.noStroke();
        
        // Pulso mais intenso conforme o núcleo recebe dano
        const basePulseRate = 100 + this.coreHitCount * 50; // Frequência aumenta com dano
        const pulseSize = 1 + Math.sin(this.p5.millis() / basePulseRate) * (0.2 + energyLevel * 0.3);
        
        // Camadas externas brilhantes com cores variáveis
        const hueShift = (this.p5.millis() * 0.05) % 360; // Mudança de cor ao longo do tempo
        
        // Determina as cores base com base no nível de energia
        let r = 255, g = 100, b = 50;
        if (energyLevel > 0.3) {
          r = 255;
          g = 50 + 100 * Math.sin(this.p5.millis() * 0.002);
          b = 150 * energyLevel;
        }
        
        for (let i = 4; i >= 0; i--) {
          const alpha = 120 - i * 20;
          const size = this.coreSize * (1.5 + i * 0.5) * pulseSize;
          const waveEffect = Math.sin(this.p5.millis() * 0.004 + i * 0.5) * 10 * energyLevel;
          
          // Adiciona variação de cor com base na energia
          const colorPulse = Math.sin(this.p5.millis() * 0.003 + i) * 50;
          this.p5.fill(
            r + colorPulse * energyLevel,
            g + colorPulse * (1-energyLevel),
            b + colorPulse,
            alpha
          );
          
          // Forma que varia entre círculo e forma estelar conforme recebe dano
          if (energyLevel > 0.5) {
            this.drawStar(coreX, coreY, size + waveEffect, size * 0.6, 5 + Math.floor(energyLevel * 3));
          } else {
            this.p5.ellipse(coreX, coreY, size + waveEffect, size);
          }
        }
        
        // Desenha o núcleo principal (efeito de turbulência aumenta com danos)
        const coreTurbulence = energyLevel * 10;
        this.p5.fill(255, 20 + energyLevel * 200, 20);
        if (energyLevel > 0.7) {
          // Cria um efeito de fissura no núcleo quando está perto de ser destruído
          for (let j = 0; j < 8; j++) {
            const angle = j * Math.PI/4 + this.p5.millis() * 0.001;
            const crackX = coreX + Math.cos(angle) * this.coreSize * 0.3 * pulseSize;
            const crackY = coreY + Math.sin(angle) * this.coreSize * 0.3 * pulseSize;
            const crackSize = this.coreSize * 0.3 * pulseSize;
            this.p5.fill(255, 255, 50, 200);
            this.p5.ellipse(crackX, crackY, crackSize, crackSize);
          }
        }
        
        // Núcleo com forma variável
        const coreDistortion = 1 + Math.sin(this.p5.millis() * 0.006) * 0.2 * energyLevel;
        this.p5.fill(255, 50 + energyLevel * 200, 20 + energyLevel * 100);
        this.p5.ellipse(coreX, coreY, this.coreSize * pulseSize * coreDistortion, this.coreSize * pulseSize / coreDistortion);
        
        // Centro brilhante com animação espiral
        this.p5.fill(255, 200 + Math.sin(this.p5.millis() * 0.01) * 55, 100);
        const centerSize = this.coreSize * 0.6 * pulseSize;
        
        // Pontos de luz na superfície do núcleo
        const dotsCount = 5 + Math.floor(energyLevel * 8);
        for (let k = 0; k < dotsCount; k++) {
          const dotAngle = (k / dotsCount) * Math.PI * 2 + this.p5.millis() * 0.002;
          const dotDist = centerSize * 0.4;
          const dotX = coreX + Math.cos(dotAngle) * dotDist;
          const dotY = coreY + Math.sin(dotAngle) * dotDist;
          const dotSize = 2 + Math.sin(this.p5.millis() * 0.01 + k) * 2;
          this.p5.fill(255, 255, 200);
          this.p5.ellipse(dotX, dotY, dotSize, dotSize);
        }
        
        // Centro pulsante
        this.p5.ellipse(coreX, coreY, centerSize * (1 + Math.sin(this.p5.millis() * 0.02) * 0.3), centerSize);
      }
    }
    
    this.p5.pop()
  }
  getPointOnRing(angle: number): { x: number, y: number } {
    const radius = this.innerRadius + (this.outerRadius - this.innerRadius) / 2
    const actualAngle = angle + this.rotation
    const x = this.centerX + radius * this.p5.cos(actualAngle)
    const y = this.centerY + radius * this.p5.sin(actualAngle)
    return { x, y }
  }
    movePlayer(playerAngle: number, direction: number, speed: number): number {
    // Move o jogador ao longo do anel em um sentido orbital
    this.playerAngle += direction * speed
    
    // Mantém o ângulo dentro de 0 a TWO_PI
    if (this.playerAngle >= this.p5.TWO_PI) {
      this.playerAngle -= this.p5.TWO_PI
    } else if (this.playerAngle < 0) {
      this.playerAngle += this.p5.TWO_PI
    }
    
    return this.playerAngle
  }
  
  getPlayerPosition() {
    return this.getPointOnRing(this.playerAngle)
  }
    getRingWidth(): number {
    return this.outerRadius - this.innerRadius
  }
  
  getRandomAngle() {
    // Retorna um ângulo aleatório no anel
    return this.p5.random(this.p5.TWO_PI)
  }
  
  // Desenha uma forma estelar (para o núcleo energizado)
  drawStar(x: number, y: number, outerRadius: number, innerRadius: number, points: number, r?: number, g?: number, b?: number) {
    const time = this.p5.millis() * 0.001;
    let angle = Math.PI / points;
    
    // Efeito de pulsação nas pontas da estrela
    const pulseFactor = 1 + Math.sin(time * 3) * 0.1;
    const dynamicOuterRadius = outerRadius * pulseFactor;
    
    // Efeito de rotação variável (mais rápido quando há mais pontas)
    const rotationSpeed = 0.001 * (1 + points * 0.1);
    const rotation = time * rotationSpeed;
    
    // Efeito de "respiração" do interior
    const breatheFactor = 1 + Math.sin(time * 1.5) * 0.15;
    const dynamicInnerRadius = innerRadius * breatheFactor;
    
    // Inicia o desenho da forma
    this.p5.beginShape();
    
    // Adiciona pequenas perturbações nas pontas para dar um aspecto de energia instável
    for (let i = 0; i < points * 2; i++) {
      // Variação no raio para cada ponta
      const wobble = (i % 2 === 0) ? Math.sin(time * 5 + i) * 0.1 : 0;
      const radius = i % 2 === 0 
        ? dynamicOuterRadius * (1 + wobble)
        : dynamicInnerRadius;
      
      const currAngle = i * angle + rotation;
      
      // Pequenos deslocamentos aleatórios nas pontas externas para um efeito de energia vibrante
      let sx, sy;
      if (i % 2 === 0) {  // Apenas nas pontas externas
        const jitter = Math.sin(time * 10 + i * 2) * 2;
        sx = x + Math.cos(currAngle) * radius + jitter;
        sy = y + Math.sin(currAngle) * radius + jitter;
      } else {
        sx = x + Math.cos(currAngle) * radius;
        sy = y + Math.sin(currAngle) * radius;
      }
      
      this.p5.vertex(sx, sy);
    }
    
    this.p5.endShape(this.p5.CLOSE);
    
    // Adiciona um brilho interno na estrela para dar um efeito de energia
    if (r !== undefined && g !== undefined && b !== undefined) {
      this.p5.fill(r, g, b, 150);
      this.p5.beginShape();
      
      const innerGlowRadius = innerRadius * 0.7;
      for (let i = 0; i < points * 2; i++) {
        const radius = i % 2 === 0 
          ? innerGlowRadius * 1.2
          : innerGlowRadius * 0.8;
          
        const glowAngle = i * angle + rotation * 1.5; // Rotação ligeiramente diferente
        const sx = x + Math.cos(glowAngle) * radius;
        const sy = y + Math.sin(glowAngle) * radius;
        this.p5.vertex(sx, sy);
      }
      
      this.p5.endShape(this.p5.CLOSE);
    }
  }
  
  getCorePosition() {
    if (!this.coreActive) return null;
    
    // Calcula a posição global do núcleo
    const coreDistance = this.planetRadius * 0.6;
    const actualAngle = this.coreAngle + this.rotation;
    const coreX = this.centerX + coreDistance * Math.cos(actualAngle);
    const coreY = this.centerY + coreDistance * Math.sin(actualAngle);
    
    return {
      x: coreX,
      y: coreY,
      radius: this.coreSize / 2,
      active: this.coreActive && this.coreVisible
    };
  }
  
  hitCore() {
    // Registra um acerto no núcleo
    if (this.coreActive) {
      this.coreHitCount++;
      
      // Efeito visual mais dinâmico de acerto
      const originalSize = this.coreSize;
      
      // Expansão inicial rápida
      this.coreSize *= 1.4;
      
      // Sequência de pulsações para criar um efeito mais dramático
      setTimeout(() => {
        if (this.coreSize) this.coreSize = originalSize * 1.2;
        
        setTimeout(() => {
          if (this.coreSize) this.coreSize = originalSize * 1.3;
          
          setTimeout(() => {
            if (this.coreSize) this.coreSize = originalSize * 1.1;
            
            setTimeout(() => {
              if (this.coreSize) this.coreSize = originalSize;
            }, 100);
          }, 80);
        }, 70);
      }, 50);
      
      // Reposiciona levemente o núcleo ao ser atingido
      const originalAngle = this.coreAngle;
      this.coreAngle += (Math.random() * 0.3 - 0.15) * (this.coreHitCount * 0.5);
      
      // Torna o núcleo brevemente invisível para simular o flash do impacto
      this.coreVisible = false;
      setTimeout(() => {
        this.coreVisible = true;
      }, 60);
      
      // Verifica se atingiu o número necessário de acertos
      if (this.coreHitCount >= this.coreMaxHits) {
        // Efeito de explosão final do núcleo (implementado por animação)
        this.coreActive = false;
        this.coreHitCount = 0;
        
        // Faz várias pulsações antes de desaparecer
        const pulseCount = 5;
        for (let i = 0; i < pulseCount; i++) {
          setTimeout(() => {
            if (i < pulseCount - 1) {
              this.coreSize = originalSize * (1.5 + i * 0.3);
              this.coreVisible = !this.coreVisible;
            } else {
              // Na última pulsação, desativa completamente
              this.coreSize = 0;
              this.coreVisible = false;
            }
          }, i * 100);
        }
        
        return true; // Retorna que o núcleo foi destruído
      }
    }
    return false; // Núcleo ainda não foi destruído
  }
  
  resetCore() {
    // Reinicia o núcleo para uma nova posição
    this.coreActive = true;
    this.coreAngle = this.p5.random(this.p5.TWO_PI);
    this.coreHitCount = 0;
  }
}
