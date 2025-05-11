import { useRef, useCallback } from 'react';
import { checkCollision, pointInCircle } from '@/utils/physics';
import { Position, Dimensions } from '@/types';

interface CollisionObject extends Position, Dimensions {
  active: boolean;
}

interface UseCollisionProps {
  onCollision?: (entityA: any, entityB: any, type: string) => void;
}

/**
 * Hook para gerenciar colisões entre diferentes tipos de entidades
 */
export function useCollision({ onCollision }: UseCollisionProps = {}) {
  // Referência para armazenar os resultados de colisões recentes
  // Isso é útil para evitar colisões duplas no mesmo frame
  const recentCollisionsRef = useRef<Set<string>>(new Set());
  
  // Verificar colisão entre o jogador e um array de objetos
  const checkPlayerCollisions = useCallback((
    player: Position & Dimensions, 
    objects: CollisionObject[], 
    collisionType: string
  ): CollisionObject | null => {
    if (!objects || !player) return null;
    
    for (const obj of objects) {
      if (!obj.active) continue;
      
      // Cria um ID único para esta colisão
      const collisionId = `player-${obj.x.toFixed(0)}-${obj.y.toFixed(0)}`;
      
      // Verifica se esta colisão já foi registrada recentemente
      if (recentCollisionsRef.current.has(collisionId)) {
        continue;
      }
      
      // Verifica a colisão
      if (checkCollision(
        player.x, player.y, player.width, player.height,
        obj.x, obj.y, obj.width, obj.height
      )) {
        // Registra esta colisão para evitar duplicatas
        recentCollisionsRef.current.add(collisionId);
        setTimeout(() => recentCollisionsRef.current.delete(collisionId), 500);
        
        // Dispara o callback de colisão, se existir
        if (onCollision) {
          onCollision(player, obj, collisionType);
        }
        
        return obj;
      }
    }
    
    return null;
  }, [onCollision]);
  
  // Verificar colisão entre projéteis e objetos
  const checkProjectileCollisions = useCallback((
    projectiles: CollisionObject[], 
    targets: CollisionObject[], 
    collisionType: string
  ): { projectile: CollisionObject, target: CollisionObject } | null => {
    if (!projectiles || !targets) return null;
    
    for (const projectile of projectiles) {
      if (!projectile.active) continue;
      
      for (const target of targets) {
        if (!target.active) continue;
        
        // Cria um ID único para esta colisão
        const collisionId = `proj-${projectile.x.toFixed(0)}-${projectile.y.toFixed(0)}-${target.x.toFixed(0)}-${target.y.toFixed(0)}`;
        
        // Verifica se esta colisão já foi registrada recentemente
        if (recentCollisionsRef.current.has(collisionId)) {
          continue;
        }
        
        // Verifica a colisão
        if (checkCollision(
          projectile.x, projectile.y, projectile.width, projectile.height,
          target.x, target.y, target.width, target.height
        )) {
          // Registra esta colisão para evitar duplicatas
          recentCollisionsRef.current.add(collisionId);
          setTimeout(() => recentCollisionsRef.current.delete(collisionId), 500);
          
          // Dispara o callback de colisão, se existir
          if (onCollision) {
            onCollision(projectile, target, collisionType);
          }
          
          return { projectile, target };
        }
      }
    }
    
    return null;
  }, [onCollision]);
  
  // Verificar colisão com o núcleo do planeta
  const checkCoreCollision = useCallback((
    projectile: Position & Dimensions,
    corePosition: { x: number, y: number, radius: number, active: boolean } | null
  ): boolean => {
    if (!corePosition || !corePosition.active || !projectile) return false;
    
    // Usa detecção de colisão círculo-ponto para melhor precisão
    return pointInCircle(
      projectile.x, projectile.y,
      corePosition.x, corePosition.y,
      corePosition.radius
    );
  }, []);
  
  // Limpa referências de colisões
  const clearCollisions = useCallback(() => {
    recentCollisionsRef.current.clear();
  }, []);
  
  return {
    checkPlayerCollisions,
    checkProjectileCollisions,
    checkCoreCollision,
    clearCollisions
  };
}

export default useCollision;
