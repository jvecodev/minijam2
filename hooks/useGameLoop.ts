import { useRef, useEffect } from 'react';
import { GameState } from '@/types';

interface UseGameLoopProps {
  isPaused: boolean;
  gameSpeed: number;
  onUpdate: (deltaTime: number, gameTime: number) => void;
}

/**
 * Hook para gerenciar o loop principal do jogo
 * Controla tempo, pausas e deltaTime
 */
export function useGameLoop({ isPaused, gameSpeed, onUpdate }: UseGameLoopProps) {
  const lastTimeRef = useRef<number>(0);
  const gameTimeRef = useRef<number>(0);
  const requestIdRef = useRef<number>(0);
  
  // Função de loop principal
  const gameLoop = (timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }
      // Calcular delta time em segundos
    const deltaTime = ((timestamp - lastTimeRef.current) / 1000) * gameSpeed;
    lastTimeRef.current = timestamp;
    
    // Somente atualiza se não estiver pausado
    if (!isPaused) {
      // Atualiza o tempo total do jogo
      gameTimeRef.current += deltaTime;

      // Executa a função de atualização com delta time afetado pelo gameSpeed
      onUpdate(deltaTime, gameTimeRef.current);
    }
    
    // Continua o loop
    requestIdRef.current = requestAnimationFrame(gameLoop);
  };
  
  // Inicia e limpa o loop
  useEffect(() => {
    // Inicia o loop
    requestIdRef.current = requestAnimationFrame(gameLoop);
    
    // Limpa quando o componente for desmontado
    return () => {
      cancelAnimationFrame(requestIdRef.current);
      lastTimeRef.current = 0;
    };
  }, [isPaused, gameSpeed]);
  
  return {
    gameTime: gameTimeRef.current,
    resetGameTime: () => { gameTimeRef.current = 0; }
  };
}

export default useGameLoop;
