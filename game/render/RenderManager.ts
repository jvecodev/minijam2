import type p5Types from "p5";
import { Position, Dimensions } from "@/types";

/**
 * Interface para objetos renderizáveis
 */
export interface Renderable {
  draw: () => void;
}

/**
 * Gerenciador de renderização para desenhar diferentes camadas
 * do jogo na ordem correta
 */
export class RenderManager {
  private p5: p5Types;
  private layers: Map<string, Renderable[]>;
  private layerOrder: string[];

  constructor(p5: p5Types) {
    this.p5 = p5;
    this.layers = new Map();
    this.layerOrder = [
      "background",
      "ring", 
      "particles_back",
      "obstacles",
      "powerups",
      "projectiles",
      "player",
      "particles_front",
      "ui"
    ];
    
    // Inicializa as camadas
    this.layerOrder.forEach(layer => {
      this.layers.set(layer, []);
    });
  }

  /**
   * Adiciona um objeto renderizável a uma camada específica
   */
  addToLayer(layerName: string, object: Renderable): void {
    if (!this.layers.has(layerName)) {
      console.warn(`Camada '${layerName}' não existe. Criando-a.`);
      this.layers.set(layerName, []);
      this.layerOrder.push(layerName);
    }
    
    const layer = this.layers.get(layerName);
    if (layer && !layer.includes(object)) {
      layer.push(object);
    }
  }

  /**
   * Remove um objeto renderizável de uma camada
   */
  removeFromLayer(layerName: string, object: Renderable): void {
    if (!this.layers.has(layerName)) return;
    
    const layer = this.layers.get(layerName);
    if (layer) {
      const index = layer.indexOf(object);
      if (index !== -1) {
        layer.splice(index, 1);
      }
    }
  }

  /**
   * Limpa todas as camadas
   */
  clearLayers(): void {
    this.layers.forEach(layer => {
      layer.length = 0;
    });
  }

  /**
   * Limpa uma camada específica
   */
  clearLayer(layerName: string): void {
    if (this.layers.has(layerName)) {
      const layer = this.layers.get(layerName);
      if (layer) {
        layer.length = 0;
      }
    }
  }

  /**
   * Renderiza todas as camadas na ordem correta
   */
  render(): void {
    this.layerOrder.forEach(layerName => {
      const layer = this.layers.get(layerName);
      if (layer) {
        layer.forEach(object => {
          if (typeof object.draw === 'function') {
            // Salva o estado atual
            this.p5.push();
            
            // Renderiza o objeto
            object.draw();
            
            // Restaura o estado
            this.p5.pop();
          }
        });
      }
    });
  }

  /**
   * Define a ordem de renderização das camadas
   */
  setLayerOrder(order: string[]): void {
    // Verifica se todas as camadas no novo ordem existem
    const existingLayers = Array.from(this.layers.keys());
    const missingLayers = order.filter(layer => !existingLayers.includes(layer));
    
    if (missingLayers.length > 0) {
      console.warn(`Camadas não encontradas: ${missingLayers.join(', ')}`);
      // Cria as camadas que faltam
      missingLayers.forEach(layer => {
        this.layers.set(layer, []);
      });
    }
    
    // Verifica se todas as camadas existentes estão incluídas na nova ordem
    const missingFromOrder = existingLayers.filter(layer => !order.includes(layer));
    
    if (missingFromOrder.length > 0) {
      console.warn(`Camadas existentes não incluídas na ordem: ${missingFromOrder.join(', ')}`);
      // Adiciona as camadas faltantes ao final da ordem
      order.push(...missingFromOrder);
    }
    
    this.layerOrder = order;
  }

  /**
   * Aplica efeitos visuais e filtros à cena
   */
  applyEffects(gameTime: number): void {
    const time = this.p5.millis() * 0.001;
    
    // Vinheta (escurecimento nas bordas)
    const vignette = (x: number, y: number, w: number, h: number) => {
      this.p5.noStroke();
      
      // Calcula a distância do centro
      const centerX = w / 2;
      const centerY = h / 2;
      const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
      
      // Gradiente radial do centro para as bordas
      for (let r = 0; r < 10; r++) {
        const radius = maxDist * (1 - r / 10);
        const alpha = r * 8; // Aumenta a opacidade em direção às bordas
        
        this.p5.fill(0, 0, 0, alpha);
        this.p5.ellipse(centerX, centerY, w * 2 - radius * 2, h * 2 - radius * 2);
      }
    };
    
    // Aplica vinheta
    vignette(0, 0, this.p5.width, this.p5.height);
    
    // Efeito de pulsação sutil na tela inteira
    const pulseAlpha = Math.sin(time * 0.5) * 5 + 5;
    if (pulseAlpha > 0) {
      this.p5.fill(100, 120, 255, pulseAlpha);
      this.p5.rect(0, 0, this.p5.width, this.p5.height);
    }
  }
}
