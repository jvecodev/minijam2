import type p5Types from "p5"

export class CoreProjectile {
  p5: p5Types
  x: number
  y: number
  width: number
  height: number
  speed: number
  active: boolean
  directionX: number
  directionY: number
  distanceTraveled: number
  maxDistance: number
  color: { r: number; g: number; b: number; }
  
  constructor(p5: p5Types, startX: number, startY: number, directionX: number, directionY: number) {
    this.p5 = p5
    this.x = startX
    this.y = startY
    this.width = this.p5.random(14, 22) // Projéteis do núcleo são maiores e mais visíveis
    this.height = this.width
    this.speed = this.p5.random(7, 12) // Velocidade um pouco maior para tornar mais desafiador
    this.active = true
    
    // Normaliza a direção
    const distance = Math.sqrt(directionX * directionX + directionY * directionY)
    this.directionX = directionX / distance
    this.directionY = directionY / distance
    
    // Adiciona pequena variação aleatória na direção para dificultar a previsibilidade
    this.directionX += this.p5.random(-0.2, 0.2)
    this.directionY += this.p5.random(-0.2, 0.2)
    
    // Renormaliza após adicionar variação
    const newDistance = Math.sqrt(this.directionX * this.directionX + this.directionY * this.directionY)
    this.directionX = this.directionX / newDistance
    this.directionY = this.directionY / newDistance
    
    this.distanceTraveled = 0
    this.maxDistance = this.p5.width * 2 // Pode viajar mais longe que os projéteis do jogador
    
    // Cores mais quentes/avermelhadas para os projéteis do núcleo
    const r = this.p5.random(220, 255)
    const g = this.p5.random(50, 150)
    const b = this.p5.random(20, 100)
    this.color = { r, g, b }
  }
  update(deltaTime: number) {
    if (!this.active) return
    
    // Movimento simples na direção definida, sem animações
    const moveAmount = this.speed * deltaTime * 60
    this.x += this.directionX * moveAmount
    this.y += this.directionY * moveAmount
    
    // Atualiza a distância percorrida
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
    ){
      this.active = false
    }
  }  draw() {
    if (!this.active) return
    
    this.p5.push()
    
    // Efeito de brilho externo
    this.p5.noStroke()
    const time = this.p5.millis() * 0.005
    const pulseAmount = Math.sin(time) * 0.2 + 1  // Pulsação suave
    
    // Camada de brilho externa
    this.p5.fill(this.color.r, this.color.g, this.color.b, 60)
    this.p5.ellipse(this.x, this.y, this.width * 1.8 * pulseAmount, this.height * 1.8 * pulseAmount)
    
    // Camada de brilho média
    this.p5.fill(this.color.r, this.color.g, this.color.b, 100)
    this.p5.ellipse(this.x, this.y, this.width * 1.4 * pulseAmount, this.height * 1.4 * pulseAmount)
    
    // Corpo principal do projétil - usar blendMode para criar efeito mais intenso
    this.p5.blendMode(this.p5.ADD)
    
    // Corpo do projétil com gradiente
    const ctx = this.p5.drawingContext as CanvasRenderingContext2D
    const gradient = ctx.createRadialGradient(
      this.x, this.y, 0,
      this.x, this.y, this.width/2
    )
    
    // Gradiente do centro para a borda
    gradient.addColorStop(0, `rgba(255, 255, 200, 0.9)`)
    gradient.addColorStop(0.4, `rgba(${this.color.r}, ${this.color.g+50}, ${this.color.b}, 0.8)`)
    gradient.addColorStop(1, `rgba(${this.color.r-50}, ${this.color.g-50}, ${this.color.b}, 0.1)`)
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.width/2, 0, Math.PI * 2)
    ctx.fill()
    
    // Adiciona partículas de energia ao redor
    const particleCount = 3
    for (let i = 0; i < particleCount; i++) {
      const angle = time + i * Math.PI * 2 / particleCount
      const distance = this.width * 0.3 * Math.sin(time * 2 + i)
      const px = this.x + Math.cos(angle) * distance
      const py = this.y + Math.sin(angle) * distance
      const particleSize = this.width * 0.2 * (Math.sin(time * 3 + i) * 0.3 + 0.7)
      
      this.p5.fill(255, 255, 200, 150)
      this.p5.ellipse(px, py, particleSize, particleSize)
    }
    
    // Núcleo brilhante central
    this.p5.fill(255, 255, 220, 255)
    this.p5.ellipse(this.x, this.y, this.width * 0.3, this.height * 0.3)
    
    this.p5.blendMode(this.p5.BLEND)
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

export class CoreProjectileManager {
  p5: p5Types
  projectiles: CoreProjectile[]
  nextFireTime: number
  minFireInterval: number
  maxFireInterval: number
  isAiming: boolean
  aimStartTime: number
  aimTarget: {x: number, y: number} | null
  aimSource: {x: number, y: number} | null
  
  constructor(p5: p5Types) {
    this.p5 = p5
    this.projectiles = []
    this.nextFireTime = this.p5.millis() + this.p5.random(2000, 4000) // Primeiro disparo após 2-4 segundos
    this.minFireInterval = 1500 // Intervalo mínimo entre disparos (1.5 segundos)
    this.maxFireInterval = 4000 // Intervalo máximo entre disparos (4 segundos)
    this.isAiming = false
    this.aimStartTime = 0
    this.aimTarget = null
    this.aimSource = null
  }
    fireFromCore(coreX: number, coreY: number, targetX: number, targetY: number) {
    // Calcula a direção para o alvo (jogador)
    const dirX = targetX - coreX
    const dirY = targetY - coreY
    
    // Chance de lançar múltiplos projéteis em direções ligeiramente diferentes
    const numberOfProjectiles = Math.random() < 0.3 ? 2 : 1; // 30% de chance de atirar 2 projéteis
    
    for (let i = 0; i < numberOfProjectiles; i++) {
      // Cria o novo projétil com uma leve variação na direção para cada projétil adicional
      const angleVariation = i === 0 ? 0 : this.p5.random(-0.3, 0.3);
      const cosVariation = Math.cos(angleVariation);
      const sinVariation = Math.sin(angleVariation);
      
      // Rotação da direção
      const rotatedDirX = dirX * cosVariation - dirY * sinVariation;
      const rotatedDirY = dirX * sinVariation + dirY * cosVariation;
      
      const projectile = new CoreProjectile(this.p5, coreX, coreY, rotatedDirX, rotatedDirY);
      this.projectiles.push(projectile);
    }
    
    // Define o próximo momento para disparar
    this.nextFireTime = this.p5.millis() + this.p5.random(this.minFireInterval, this.maxFireInterval)
  }
  update(deltaTime: number, corePosition: { x: number, y: number, radius: number, active: boolean } | null, playerX: number, playerY: number) {
    // Verifica se é hora de disparar um novo projétil
    const currentTime = this.p5.millis()
    
    // Preparação para o disparo - começa a mostrar o trilho de mira 1 segundo antes
    if (corePosition && corePosition.active && currentTime >= this.nextFireTime - 1000 && !this.isAiming) {
      // Inicia a animação do trilho de mira
      this.isAiming = true;
      this.aimStartTime = currentTime;
      
      // Define a origem e o destino do trilho de mira
      this.aimSource = { x: corePosition.x, y: corePosition.y };
      
      // Adiciona uma pequena chance do núcleo "errar" o alvo deliberadamente
      const targetOffsetX = this.p5.random(-80, 80); // Offset aleatório na mira
      const targetOffsetY = this.p5.random(-80, 80);
      this.aimTarget = { x: playerX + targetOffsetX, y: playerY + targetOffsetY };
    }
    
    // Dispara apenas se o núcleo estiver visível e ativo
    if (corePosition && corePosition.active && currentTime >= this.nextFireTime) {
      // Dispara para o alvo predefinido
      if (this.aimSource && this.aimTarget) {
        this.fireFromCore(this.aimSource.x, this.aimSource.y, this.aimTarget.x, this.aimTarget.y);
      }
      
      // Reseta o estado de mira após o disparo
      this.isAiming = false;
      this.aimTarget = null;
      this.aimSource = null;
      
      // Som de disparo (se for implementado no jogo)
      // playSound("coreShot");
    }
    
    // Atualiza todos os projéteis
    for (const projectile of this.projectiles) {
      projectile.update(deltaTime)
    }
    
    // Remove projéteis inativos
    this.projectiles = this.projectiles.filter(p => p.active)
  }
    draw() {
    // Desenha o trilho de mira quando estiver em modo de mira
    this.drawAimingLine();
    
    // Desenha todos os projéteis
    for (const projectile of this.projectiles) {
      projectile.draw()
    }
  }
    drawAimingLine() {
    if (!this.isAiming || !this.aimSource || !this.aimTarget) return;
    
    const currentTime = this.p5.millis();
    const aimDuration = currentTime - this.aimStartTime;
    const aimProgress = Math.min(aimDuration / 1000, 1.0); // Progresso de 0 a 1 em 1 segundo
    
    // Preparando o estilo do trilho de mira
    this.p5.push();
    
    // Calcula a distância entre a origem e o destino
    const dx = this.aimTarget.x - this.aimSource.x;
    const dy = this.aimTarget.y - this.aimSource.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Calcula o ângulo da linha para criar o efeito de trilho
    const angle = Math.atan2(dy, dx);
    
    // O trilho fica mais definido à medida que se aproxima do momento do disparo
    const maxSegments = 18;
    const numSegments = Math.floor(aimProgress * maxSegments);
    const segmentLength = distance / maxSegments;
    
    // Modo de mistura aditivo para cores mais brilhantes
    this.p5.blendMode(this.p5.ADD);
    
    // Desenha um efeito de "feixe de rastreamento" - uma linha fina que percorre o caminho rapidamente
    const beamProgress = (aimProgress * 3) % 1;
    if (aimProgress > 0.2) {
      const beamPosition = beamProgress * distance;
      const beamX = this.aimSource.x + Math.cos(angle) * beamPosition;
      const beamY = this.aimSource.y + Math.sin(angle) * beamPosition;
      
      // Brilho intenso do feixe
      const beamSize = 8 + Math.sin(currentTime * 0.01) * 2;
      this.p5.fill(255, 220, 180, 200);
      this.p5.noStroke();
      this.p5.ellipse(beamX, beamY, beamSize, beamSize);
      
      // Pequena cauda do feixe
      for (let i = 1; i < 5; i++) {
        const tailX = beamX - Math.cos(angle) * i * 4;
        const tailY = beamY - Math.sin(angle) * i * 4;
        this.p5.fill(255, 200, 150, 150 - i * 30);
        this.p5.ellipse(tailX, tailY, beamSize - i, beamSize - i);
      }
    }
    
    // Desenha o trilho principal
    const lineWidth = 6 * Math.sin(currentTime * 0.005) * 0.3 + 0.7; // Efeito de pulsação
    
    // Primeiro desenha um "túnel" de energia holográfico ao longo do caminho
    const ctx = this.p5.drawingContext as CanvasRenderingContext2D;
    
    // Define o gradiente para o trilho
    const gradient = ctx.createLinearGradient(
      this.aimSource.x, this.aimSource.y,
      this.aimTarget.x, this.aimTarget.y
    );
    
    // Cores energéticas para o gradiente
    gradient.addColorStop(0, `rgba(255, 100, 50, ${aimProgress * 0.7})`);
    gradient.addColorStop(0.5, `rgba(255, 160, 20, ${aimProgress * 0.5})`);
    gradient.addColorStop(1, `rgba(255, 200, 100, ${aimProgress * 0.2})`);
    
    // Desenha o túnel principal
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 12 * aimProgress;
    ctx.beginPath();
    ctx.moveTo(this.aimSource.x, this.aimSource.y);
    ctx.lineTo(this.aimTarget.x, this.aimTarget.y);
    ctx.stroke();
    
    // Borda interna mais brilhante
    ctx.strokeStyle = `rgba(255, 230, 180, ${aimProgress * 0.8})`;
    ctx.lineWidth = 4 * aimProgress;
    ctx.beginPath();
    ctx.moveTo(this.aimSource.x, this.aimSource.y);
    ctx.lineTo(this.aimTarget.x, this.aimTarget.y);
    ctx.stroke();
    
    // Desenha segmentos de energia que fluem ao longo do trilho
    for (let i = 0; i < numSegments; i++) {
      // Efeito de fluxo - os segmentos se movem ao longo do tempo
      const flowOffset = (currentTime * 0.003 + i * 0.2) % 1;
      const segPos = (i / maxSegments + flowOffset) % 1;
      
      // Posição do segmento
      const segX = this.aimSource.x + Math.cos(angle) * distance * segPos;
      const segY = this.aimSource.y + Math.sin(angle) * distance * segPos;
      
      // Tamanho e opacidade variam com o progresso da mira
      const segSize = (1 - segPos) * 8 * aimProgress + 2;
      const segAlpha = (1 - segPos) * 255 * aimProgress;
      
      // Cores quentes para os segmentos de energia
      this.p5.noStroke();
      this.p5.fill(255, 200, 100, segAlpha * 0.7);
      this.p5.ellipse(segX, segY, segSize * lineWidth, segSize * lineWidth);
    }
    
    // Desenha o alvo - um círculo de energia com efeito de mira
    if (aimProgress > 0.3) {
      // Fator de visibilidade baseado no progresso
      const visibility = (aimProgress - 0.3) / 0.7;
      
      // Anéis concêntricos pulsantes
      const ringCount = 3;
      const maxRingSize = 30 * Math.sin(currentTime * 0.008) * 0.3 + 1.2;
      
      for (let i = 0; i < ringCount; i++) {
        const ringProgress = (currentTime * 0.005 + i * 0.33) % 1;
        const ringSize = maxRingSize * ringProgress * visibility;
        const ringAlpha = (1 - ringProgress) * 200 * visibility;
        
        this.p5.noFill();
        this.p5.strokeWeight(1.5);
        this.p5.stroke(255, 100, 50, ringAlpha);
        this.p5.ellipse(this.aimTarget.x, this.aimTarget.y, ringSize, ringSize);
      }
      
      // Centro do alvo
      const targetPulse = Math.sin(currentTime * 0.01) * 0.3 + 1;
      const targetSize = 10 * targetPulse * visibility;
      
      // Brilho ao redor
      this.p5.noStroke();
      this.p5.fill(255, 150, 50, 100 * visibility);
      this.p5.ellipse(this.aimTarget.x, this.aimTarget.y, targetSize * 2, targetSize * 2);
      
      // Centro brilhante
      this.p5.fill(255, 220, 180, 200 * visibility);
      this.p5.ellipse(this.aimTarget.x, this.aimTarget.y, targetSize, targetSize);
      
      // Linhas cruzadas (mira)
      if (aimProgress > 0.7) {
        const crossSize = 15 * visibility;
        const crossAlpha = (aimProgress - 0.7) / 0.3 * 200;
        
        this.p5.stroke(255, 100, 50, crossAlpha);
        this.p5.strokeWeight(1);
        
        this.p5.line(this.aimTarget.x - crossSize, this.aimTarget.y, 
                    this.aimTarget.x + crossSize, this.aimTarget.y);
                    
        this.p5.line(this.aimTarget.x, this.aimTarget.y - crossSize, 
                    this.aimTarget.x, this.aimTarget.y + crossSize);
      }
    }
    
    // Restaura o modo de mistura padrão
    this.p5.blendMode(this.p5.BLEND);
    this.p5.pop();
  }
  
  getProjectiles() {
    return this.projectiles
  }
    // Ajusta a frequência de disparo com base no nível
  adjustDifficulty(level: number) {
    // Diminui o intervalo entre disparos conforme o nível aumenta
    this.minFireInterval = Math.max(600, 1500 - (level - 1) * 180)  // Mínimo de 0.6 segundos
    this.maxFireInterval = Math.max(1500, 4000 - (level - 1) * 400) // Mínimo de 1.5 segundos
  }
}
