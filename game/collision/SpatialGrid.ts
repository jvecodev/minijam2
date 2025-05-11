import { Position, Dimensions } from '@/types';
import { checkCollision, pointInCircle, calculateDistance } from '@/utils/physics';

/**
 * Sistema de grade espacial básico para otimizar colisões
 * Divide o espaço em células e armazena objetos em cada célula
 * para reduzir o número de verificações de colisão
 */
export class SpatialGrid {
  private grid: Map<string, any[]>;
  private cellSize: number;
  private width: number;
  private height: number;

  constructor(width: number, height: number, cellSize: number = 100) {
    this.grid = new Map();
    this.cellSize = cellSize;
    this.width = width;
    this.height = height;
  }

  /**
   * Calcula a chave da célula com base na posição
   */
  private getCellKey(x: number, y: number): string {
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    return `${cellX},${cellY}`;
  }

  /**
   * Insere um objeto na grade espacial
   */
  insert(object: Position & { id?: string | number }): void {
    const cellKey = this.getCellKey(object.x, object.y);
    
    if (!this.grid.has(cellKey)) {
      this.grid.set(cellKey, []);
    }
    
    const cell = this.grid.get(cellKey);
    if (cell) {
      cell.push(object);
    }
  }

  /**
   * Limpa a grade espacial
   */
  clear(): void {
    this.grid.clear();
  }
  /**
   * Obtém objetos próximos a uma posição
   * Otimizado: reutiliza arrays para reduzir alocação de memória
   */
  getNearbyObjects(x: number, y: number, radius: number = this.cellSize): any[] {
    const cellKey = this.getCellKey(x, y);
    const objects: any[] = [];
    
    // Calcular o número de células para verificar com base no raio
    const cellRadius = Math.ceil(radius / this.cellSize);
    
    // Calcular células a verificar com base no raio fornecido
    const cellX = Math.floor(x / this.cellSize);
    const cellY = Math.floor(y / this.cellSize);
    
    // Verificar células no raio
    for (let dx = -cellRadius; dx <= cellRadius; dx++) {
      for (let dy = -cellRadius; dy <= cellRadius; dy++) {
        // Otimização: se a célula estiver mais longe do que o raio máximo, podemos pular
        if (dx*dx + dy*dy > cellRadius*cellRadius + 1) continue; // +1 para segurança
        
        const nx = cellX + dx;
        const ny = cellY + dy;
        const neighborKey = `${nx},${ny}`;
        
        if (this.grid.has(neighborKey)) {
          objects.push(...(this.grid.get(neighborKey) || []));
        }
      }
    }
    
    return objects;
  }
  /**
   * Verifica colisões para um objeto específico
   * Otimizado: verifica primeiro a distância aproximada para descartar colisões óbvias
   */
  checkCollisions(object: Position & Dimensions, filter?: (obj: any) => boolean): any[] {
    const nearbyObjects = this.getNearbyObjects(object.x, object.y);
    const collisions: any[] = [];
    
    // Pré-calcular dimensão máxima do objeto para teste de distância rápido
    const objRadius = Math.max(object.width, object.height) / 2;
    const objCenterX = object.x + object.width / 2;
    const objCenterY = object.y + object.height / 2;
    
    for (const other of nearbyObjects) {
      // Pula o próprio objeto ou objetos que não passam no filtro
      if (other === object || (filter && !filter(other))) {
        continue;
      }
      
      // Teste rápido de distância antes da colisão completa
      if (other.width && other.height) {
        const otherCenterX = other.x + other.width / 2;
        const otherCenterY = other.y + other.height / 2;
        const otherRadius = Math.max(other.width, other.height) / 2;
        
        // Distância aproximada entre os centros dos objetos
        const dx = otherCenterX - objCenterX;
        const dy = otherCenterY - objCenterY;
        const distSq = dx * dx + dy * dy;
        
        // Verifica se a distância é grande demais para haver colisão
        const minDistSq = Math.pow(objRadius + otherRadius, 2);
        if (distSq > minDistSq) {
          continue; // Pula a verificação completa se os objetos estão muito distantes
        }
        
        // Verifica colisão precisa se passou na verificação aproximada
        if (checkCollision(
          object.x, object.y, object.width, object.height,
          other.x, other.y, other.width, other.height
        )) {
          collisions.push(other);
        }
      }
    }
    
    return collisions;
  }
}

/**
 * Sistema de colisões para gerenciar todas as verificações de colisão do jogo
 */
export class CollisionSystem {
  private spatialGrid: SpatialGrid;
  private recentCollisions: Map<string, number>;
  
  constructor(width: number, height: number, cellSize: number = 100) {
    this.spatialGrid = new SpatialGrid(width, height, cellSize);
    this.recentCollisions = new Map();
  }
  
  /**
   * Atualiza o sistema de colisões com novos objetos
   */
  update(objects: Array<Position & { id?: string | number, active?: boolean }>): void {
    this.spatialGrid.clear();
    
    // Adiciona apenas objetos ativos à grade espacial
    for (const obj of objects) {
      if (obj.active === false) continue;
      this.spatialGrid.insert(obj);
    }
    
    // Limpa colisões antigas
    const now = Date.now();
    this.recentCollisions.forEach((timestamp, id) => {
      if (now - timestamp > 500) {
        this.recentCollisions.delete(id);
      }
    });
  }
  
  /**
   * Verifica colisões entre um objeto e outros objetos na mesma célula
   */
  checkCollisions(object: Position & Dimensions, filter?: (obj: any) => boolean): any[] {
    return this.spatialGrid.checkCollisions(object, filter);
  }
  
  /**
   * Verifica se já ocorreu uma colisão recentemente entre dois objetos
   */
  hasRecentCollision(objA: any, objB: any): boolean {
    const idA = objA.id || `${objA.x},${objA.y}`;
    const idB = objB.id || `${objB.x},${objB.y}`;
    const collisionId = `${idA}-${idB}`;
    
    return this.recentCollisions.has(collisionId);
  }
  
  /**
   * Registra uma colisão recente
   */
  registerCollision(objA: any, objB: any): void {
    const idA = objA.id || `${objA.x},${objA.y}`;
    const idB = objB.id || `${objB.x},${objB.y}`;
    const collisionId = `${idA}-${idB}`;
    
    this.recentCollisions.set(collisionId, Date.now());
  }
  /**
   * Verifica colisão com ponto circular (útil para núcleo)
   * Otimizado: implementação mais eficiente da colisão círculo-retângulo
   */
  checkCircleCollision(
    object: Position & Dimensions,
    circleX: number,
    circleY: number,
    radius: number
  ): boolean {
    // Calcula o ponto mais próximo do círculo dentro do retângulo
    const rectCenterX = object.x + object.width / 2;
    const rectCenterY = object.y + object.height / 2;
    
    // Teste rápido de distância entre centros
    const dx = circleX - rectCenterX;
    const dy = circleY - rectCenterY;
    const distSq = dx * dx + dy * dy;
    
    // Se a distância entre os centros for menor que a soma de metade da diagonal do retângulo + raio
    // podemos prosseguir com o teste exato, caso contrário, não há colisão
    const halfDiagonal = Math.sqrt(Math.pow(object.width/2, 2) + Math.pow(object.height/2, 2));
    if (distSq > Math.pow(halfDiagonal + radius, 2)) {
      return false;
    }
    
    // Encontra o ponto mais próximo do círculo dentro do retângulo
    const closestX = Math.max(object.x, Math.min(circleX, object.x + object.width));
    const closestY = Math.max(object.y, Math.min(circleY, object.y + object.height));
    
    // Verifica se este ponto está dentro do círculo
    return pointInCircle(closestX, closestY, circleX, circleY, radius);
  }
  /**
   * Obtém todos os objetos dentro de uma área circular
   * Otimizado: usa o raio para limitar as células verificadas
   */
  getObjectsInRadius(centerX: number, centerY: number, radius: number): any[] {
    const nearbyObjects = this.spatialGrid.getNearbyObjects(centerX, centerY, radius);
    
    // Filtragem rápida: quadrada do raio para evitar calcular raiz quadrada
    const radiusSq = radius * radius;
    
    return nearbyObjects.filter(obj => {
      const dx = obj.x - centerX;
      const dy = obj.y - centerY;
      const distanceSq = dx*dx + dy*dy;
      
      return distanceSq <= radiusSq;
    });
  }
}
