// Tipos compartilhados para o jogo

/**
 * Controles do jogador
 */
export interface PlayerControls {
  left: boolean;
  right: boolean;
  jump: boolean;
  shoot: boolean;
}

/**
 * Estado do jogo
 */
export interface GameState {
  score: number;
  lives: number;
  level: number;
  isPaused: boolean;
  isGameOver: boolean;
  isNewHighScore?: boolean;
}

/**
 * Tipos de power-ups
 */
export type PowerUpType = "shield" | "speed" | "life";

/**
 * Tipos de obstáculos
 */
export type ObstacleType = "meteor" | "ice";

/**
 * Posição 2D
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Dimensões
 */
export interface Dimensions {
  width: number;
  height: number;
}
