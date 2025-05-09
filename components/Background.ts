import type p5Types from "p5"

interface Star {
  x: number
  y: number
  size: number
  speed: number
  brightness: number
  twinkleSpeed: number
  color: { r: number, g: number, b: number }
  tailLength: number
}

export class Background {
  p5: p5Types
  stars: Star[]
  parallaxLayers: number

  constructor(p5: p5Types) {
    this.p5 = p5
    this.stars = []
    this.parallaxLayers = 3

    // Cria estrelas em diferentes camadas de paralaxe
    for (let layer = 0; layer < this.parallaxLayers; layer++) {
      const layerSpeed = 0.2 + layer * 0.4 // Camadas mais distantes movem-se mais devagar
      const starCount = 50 + layer * 50 // Mais estrelas nas camadas mais distantes

      for (let i = 0; i < starCount; i++) {
        // Cores variadas para as estrelas
        const starColorType = Math.random();
        let color;
        
        if (starColorType < 0.7) {
          // Estrelas brancas/azuladas (maioria)
          color = { 
            r: this.p5.random(200, 255), 
            g: this.p5.random(200, 255), 
            b: this.p5.random(220, 255) 
          };
        } else if (starColorType < 0.85) {
          // Estrelas amareladas/alaranjadas
          color = { 
            r: this.p5.random(220, 255), 
            g: this.p5.random(180, 220), 
            b: this.p5.random(100, 180) 
          };
        } else {
          // Estrelas avermelhadas
          color = { 
            r: this.p5.random(220, 255), 
            g: this.p5.random(100, 180), 
            b: this.p5.random(100, 150) 
          };
        }
        
        this.stars.push({
          x: this.p5.random(this.p5.width),
          y: this.p5.random(this.p5.height),
          size: this.p5.random(1, 3) / (layer + 1), // Estrelas mais distantes são menores
          speed: layerSpeed,
          brightness: this.p5.random(150, 255),
          twinkleSpeed: this.p5.random(0.01, 0.05),
          color: color,
          tailLength: layer === 0 ? this.p5.random(5, 15) : 0, // Apenas estrelas da primeira camada têm rastro
        })
      }
    }
  }

  update(gameSpeed: number) {
    const time = this.p5.millis() * 0.001; // Tempo em segundos para animações
    
    // Move as estrelas com efeito de paralaxe
    for (const star of this.stars) {
      // Movimento com velocidade variável para simular turbulência espacial
      const turbulence = Math.sin(time + star.x * 0.01) * 0.2;
      star.x -= gameSpeed * star.speed * (1 + turbulence);
      
      // Leve movimento vertical para algumas estrelas (efeito de ondulação)
      if (star.speed > 0.5) { // Apenas estrelas das camadas mais próximas
        star.y += Math.sin(time * 0.5 + star.x * 0.02) * 0.2;
      }

      // Reposiciona estrelas que saíram da tela
      if (star.x < -star.tailLength) {
        star.x = this.p5.width
        star.y = this.p5.random(this.p5.height)
        
        // Varia ligeiramente a velocidade para criar um efeito mais natural
        star.speed *= this.p5.random(0.9, 1.1);
        
        // Restringe a velocidade dentro de certos limites
        if (star.speed < 0.1) star.speed = 0.1;
        if (star.speed > 2.0) star.speed = 2.0;
      }

      // Efeito de cintilação mais complexo
      const baseBrightness = 150;
      const twinkle = Math.sin(time * 2 * star.twinkleSpeed + star.x * 0.1);
      const flickerFast = Math.sin(time * 15 * star.twinkleSpeed) * 0.2; // Cintilação rápida
      star.brightness = baseBrightness + Math.abs(twinkle + flickerFast) * 105;
    }
  }

  draw() {
    // Fundo com gradiente cósmico profundo
    this.p5.background(0)
    
    // Overlay gradiente para simular a profundidade do espaço
    const c1 = this.p5.color(15, 10, 40, 255); // Cor externa - azul escuro espacial
    const c2 = this.p5.color(3, 0, 20, 255);   // Cor central - negro profundo do espaço
    const c3 = this.p5.color(50, 0, 60, 80);   // Cor adicional para efeito nebular
    
    // Cria um gradiente radial manual mais complexo
    for (let i = 0; i < 12; i++) {
      const inter = i / 12.0;
      const c = this.p5.lerpColor(c2, c1, inter);
      const size = this.p5.width * (1 - inter * 0.4);
      this.p5.fill(c);
      this.p5.noStroke();
      this.p5.ellipse(this.p5.width/2, this.p5.height/2, size, size);
    }
    
    // Adiciona uma camada de "poeira cósmica" - pequenos pontos de estrelas distantes
    for (let i = 0; i < 100; i++) {
      const x = this.p5.random(this.p5.width);
      const y = this.p5.random(this.p5.height);
      const size = this.p5.random(0.5, 1.2);
      this.p5.fill(255, this.p5.random(50, 150));
      this.p5.ellipse(x, y, size, size);
    }

    // Nebulosas distantes (efeito decorativo com movimento lento)
    this.p5.push()
    this.p5.noStroke()
    this.p5.blendMode(this.p5.ADD); // Modo de mistura para cores mais intensas
    
    const time = this.p5.millis() * 0.0001;
    const nebulaShift = Math.sin(time) * 20; // Movimento suave da nebulosa
    const pulsation = Math.sin(time * 2) * 0.1 + 1; // Pulsação das nebulosas
    
    // Camadas de nebulosas azuis com efeitos de transparência aprimorados
    for (let i = 0; i < 4; i++) {
      const alpha = 8 + i * 7; // Maior opacidade
      const offset = i * 30;
      const wobble = Math.sin(time * (i+1)) * 20;
      
      // Cor azul mais intensa e vibrante
      this.p5.fill(30 + i*15, 50 + i*10, 150 + i*25, alpha)
      
      // Formato mais orgânico usando noise (simulando turbulência espacial)
      this.drawNebula(
        this.p5.width * 0.7 + nebulaShift + wobble, 
        this.p5.height * 0.3 - nebulaShift/2, 
        (this.p5.width * 0.5 + offset) * pulsation, 
        (this.p5.height * 0.4 + offset) * pulsation,
        time + i * 0.5
      )
    }
    
    // Camadas de nebulosas roxas com efeitos dinâmicos
    for (let i = 0; i < 4; i++) {
      const alpha = 8 + i * 7;
      const offset = i * 25;
      const wobble = Math.cos(time * (i+0.5)) * 15;
      
      // Cor roxa mais intensa, típica de nebulosas de emissão
      this.p5.fill(80 + i*10, 30 + i*5, 120 + i*15, alpha)
      
      this.drawNebula(
        this.p5.width * 0.3 - nebulaShift/2 + wobble, 
        this.p5.height * 0.8 + nebulaShift/3, 
        (this.p5.width * 0.6 + offset) * pulsation, 
        (this.p5.height * 0.3 + offset) * pulsation,
        time * 1.2 + i * 0.3
      )
    }
    
    // Nebulosa esverdeada (estilo nebulosa de oxigênio)
    const greenPulse = Math.sin(time * 3) * 0.15 + 1;
    this.p5.fill(40, 120, 70, 15) // Verde mais intenso
    this.drawNebula(
      this.p5.width * 0.2 + nebulaShift*1.2, 
      this.p5.height * 0.4, 
      this.p5.width * 0.3 * greenPulse, 
      this.p5.height * 0.25 * greenPulse,
      time * 0.8
    )
    
    // Nova nebulosa avermelhada (estilo nebulosa de hidrogênio)
    const redPulse = Math.cos(time * 2.5) * 0.12 + 1;
    this.p5.fill(180, 50, 60, 12)
    this.drawNebula(
      this.p5.width * 0.8 - nebulaShift, 
      this.p5.height * 0.7 + nebulaShift/2, 
      this.p5.width * 0.4 * redPulse, 
      this.p5.height * 0.3 * redPulse,
      time * 0.6
    )
    
    this.p5.pop()
    
    this.p5.blendMode(this.p5.BLEND); // Voltar para o modo de mistura normal
    
    // Desenha as estrelas com rastros aprimorados
    for (const star of this.stars) {
      // Desenha o rastro da estrela se tiver
      if (star.tailLength > 0 && star.speed > 0.5) {
        this.p5.noStroke();
        
        // Comprimento do rastro varia com a velocidade
        const tailSize = star.tailLength * (star.speed/0.6);
        
        // Cria um gradiente para o rastro mais suave e brilhante
        for (let i = 0; i < 8; i++) {  // Mais segmentos para um efeito mais suave
          const alpha = (8-i) * 30; // Gradiente de opacidade
          const segment = tailSize * (i/8);
          
          // Usa a cor própria da estrela com efeito de brilho
          this.p5.fill(
            Math.min(star.color.r + 30, 255), 
            Math.min(star.color.g + 30, 255), 
            Math.min(star.color.b + 30, 255), 
            alpha * (star.brightness / 255)
          );
          
          // Formato mais natural para o rastro
          const tailWidth = star.size * (8-i)/8;
          const tailHeight = star.size * 0.6 * (8-i)/8;
          this.p5.ellipse(star.x + segment, star.y, tailWidth, tailHeight);
        }
      }
      
      // Define um modo de mistura aditivo para as estrelas brilhantes
      if (star.size > 1.8 || star.brightness > 220) {
        this.p5.blendMode(this.p5.ADD);
      } else {
        this.p5.blendMode(this.p5.BLEND);
      }
      
      // Desenha a estrela com sua cor própria
      const b = star.brightness / 255;
      this.p5.fill(star.color.r * b, star.color.g * b, star.color.b * b);
      this.p5.noStroke();
      
      // Estrelas maiores têm um halo ao redor com gradiente
      if (star.size > 1.5) {
        // Halo externo suave
        this.p5.fill(star.color.r, star.color.g, star.color.b, 50);
        this.p5.ellipse(star.x, star.y, star.size * 4, star.size * 4);
        
        // Halo médio mais intenso
        this.p5.fill(star.color.r, star.color.g, star.color.b, 80);
        this.p5.ellipse(star.x, star.y, star.size * 2.5, star.size * 2.5);
        
        // Halo interno brilhante
        this.p5.fill(star.color.r, star.color.g, star.color.b, 150);
        this.p5.ellipse(star.x, star.y, star.size * 1.5, star.size * 1.5);
      }
      
      // Corpo principal da estrela mais brilhante
      const centerColor = {
        r: Math.min(star.color.r + 50, 255),
        g: Math.min(star.color.g + 50, 255),
        b: Math.min(star.color.b + 50, 255)
      };
      this.p5.fill(centerColor.r, centerColor.g, centerColor.b, star.brightness);
      this.p5.ellipse(star.x, star.y, star.size);
      
      // Adiciona efeito de difração de luz para estrelas brilhantes
      if (star.brightness > 220 && star.size > 1.2) {
        // Raios em várias direções para efeito "starburst"
        const rayCount = 8; // Mais raios
        const rayLength = star.size * 4; // Raios mais longos
        const time = this.p5.millis() * 0.001;
        
        // Pulso sutil nos raios
        const pulseFactor = 0.8 + Math.sin(time * star.twinkleSpeed * 2) * 0.2;
        
        this.p5.push();
        this.p5.translate(star.x, star.y);
        
        for (let i = 0; i < rayCount; i++) {
          const angle = (i / rayCount) * this.p5.TWO_PI;
          
          // Comprimento do raio varia ligeiramente
          const thisRayLength = rayLength * pulseFactor * (0.8 + Math.random() * 0.4);
          
          // Raios com gradiente
          const gradient = this.p5.drawingContext as CanvasRenderingContext2D;
          const grd = gradient.createLinearGradient(0, 0, Math.cos(angle) * thisRayLength, Math.sin(angle) * thisRayLength);
          
          grd.addColorStop(0, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, 0.8)`);
          grd.addColorStop(1, `rgba(${star.color.r}, ${star.color.g}, ${star.color.b}, 0)`);
          
          gradient.strokeStyle = grd;
          gradient.lineWidth = 0.8 * star.size / 2;
          gradient.beginPath();
          gradient.moveTo(0, 0);
          gradient.lineTo(Math.cos(angle) * thisRayLength, Math.sin(angle) * thisRayLength);
          gradient.stroke();
        }
        this.p5.pop();
      }
      
      // Resetar o modo de mistura
      this.p5.blendMode(this.p5.BLEND);
    }
    
    // Ocasionalmente adiciona meteoros
    if (Math.random() < 0.02) { // 2% de chance por frame
      this.addMeteor();
    }
    
    // Desenha os meteoros ativos
    this.drawMeteors();
  }
  
  // Adiciona um meteoro que atravessa o céu
  addMeteor() {
    // Decidir tipo de meteoro (comum ou especial)
    const isMeteorShower = Math.random() < 0.15; // 15% de chance de chuva de meteoros
    
    if (isMeteorShower) {
      // Cria um grupo de 3-7 meteoros em chuva
      const meteorCount = Math.floor(this.p5.random(3, 8));
      const baseAngle = this.p5.random(this.p5.PI/6, this.p5.PI/3);
      const baseSpeed = this.p5.random(15, 25);
      const baseX = this.p5.random(this.p5.width * 0.7);
      
      for (let i = 0; i < meteorCount; i++) {
        // Pequenas variações de ângulo e velocidade para cada meteoro do grupo
        const angleVar = baseAngle + this.p5.random(-0.2, 0.2);
        const speedVar = baseSpeed + this.p5.random(-5, 5);
        const startX = baseX + this.p5.random(-100, 100);
        const startY = -50 - i * 20; // Espaçados no tempo
        
        // Cores levemente diferentes para cada meteoro
        const colorVar = this.p5.random(-20, 20);
        
        this.createMeteor(
          startX, startY, speedVar, angleVar,
          { 
            r: Math.min(255, 255 + colorVar), 
            g: Math.min(255, 220 + colorVar), 
            b: Math.min(255, 180 + colorVar/2) 
          }, 
          this.p5.random(2, 3.5),
          this.p5.random(30, 50)
        );
      }
    } else {
      // Meteoro individual
      // Posição inicial aleatória no topo ou lados da tela
      const startX = this.p5.random(this.p5.width * 1.5) - this.p5.width * 0.25;
      const startY = Math.random() < 0.8 ? -50 : this.p5.random(this.p5.height/3);
      
      // Ângulo e velocidade aleatórios para o movimento diagonal
      const angle = this.p5.random(this.p5.PI/6, this.p5.PI/3);
      const speed = this.p5.random(12, 22); // Velocidade um pouco maior
      
      // Tamanho do meteoro varia
      const meteorSize = this.p5.random(2, 4.5);
      
      // Cor do meteoro - chance de ser colorido
      let meteorColor;
      if (Math.random() < 0.2) {
        // Meteoro colorido (20% de chance) - verde, azul ou vermelho
        const colorType = Math.floor(Math.random() * 3);
        if (colorType === 0) {
          // Verde
          meteorColor = { r: 150, g: 255, b: 180 };
        } else if (colorType === 1) {
          // Azul
          meteorColor = { r: 130, g: 180, b: 255 };
        } else {
          // Vermelho
          meteorColor = { r: 255, g: 130, b: 130 };
        }
      } else {
        // Meteoro comum (branco-amarelado)
        meteorColor = { r: 255, g: 220, b: 180 };
      }
      
      this.createMeteor(
        startX, startY, speed, angle,
        meteorColor,
        meteorSize,
        this.p5.random(40, 70) // Rastros mais longos
      );
    }
  }
  
  // Método auxiliar para criar um meteoro com parâmetros específicos
  createMeteor(x: number, y: number, speed: number, angle: number, color: {r: number, g: number, b: number}, size: number, tailLength: number) {
    this.stars.push({
      x: x,
      y: y,
      size: size,
      speed: speed,
      brightness: 255,
      twinkleSpeed: 0.1,
      color: color,
      tailLength: tailLength
    });
  }
  
  drawMeteors() {
    // Os meteoros especiais poderiam ter efeitos adicionais aqui
    // Por enquanto, os meteoros são desenhados junto com as estrelas
  }
  
  // Desenha uma nebulosa com formato orgânico usando noise
  drawNebula(x: number, y: number, width: number, height: number, timeOffset: number) {
    const detail = 0.03; // Controla a "rugosidade" da forma
    const points = 20;   // Número de pontos para formar a nebulosa
    const time = this.p5.millis() * 0.0001 + timeOffset;
    
    this.p5.push();
    this.p5.translate(x, y);
    
    // Cria uma forma orgânica usando noise de Perlin
    this.p5.beginShape();
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * this.p5.TWO_PI;
      
      // Usa noise para criar um raio irregular que varia com o tempo
      const noiseVal = this.p5.noise(
        Math.cos(angle) * detail + time, 
        Math.sin(angle) * detail + time
      );
      
      // O raio varia entre 80% e 120% do tamanho base
      const radius = noiseVal * 0.4 + 0.8;
      const px = Math.cos(angle) * width/2 * radius;
      const py = Math.sin(angle) * height/2 * radius;
      
      this.p5.vertex(px, py);
    }
    this.p5.endShape(this.p5.CLOSE);
    
    this.p5.pop();
  }
}
