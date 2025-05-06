/**
 * Verifica colisão entre dois retângulos
 */
export function checkCollision(
  x1: number,
  y1: number,
  width1: number,
  height1: number,
  x2: number,
  y2: number,
  width2: number,
  height2: number,
): boolean {
  return x1 < x2 + width2 && x1 + width1 > x2 && y1 < y2 + height2 && y1 + height1 > y2
}

/**
 * Aplica gravidade a um objeto
 * @param velocityY Velocidade vertical atual
 * @param gravity Força da gravidade
 * @param deltaTime Tempo desde o último frame em segundos
 * @returns Nova velocidade vertical
 */
export function applyGravity(velocityY: number, gravity: number, deltaTime: number): number {
  return velocityY + gravity * deltaTime
}

/**
 * Calcula a posição Y em uma curva senoidal
 * Útil para criar o efeito de curvatura do anel
 * @param x Posição X
 * @param width Largura total
 * @param amplitude Amplitude da curva
 * @returns Deslocamento Y
 */
export function calculateCurveY(x: number, width: number, amplitude: number): number {
  return Math.sin((x / width) * Math.PI) * amplitude
}

/**
 * Mantém um valor dentro de um intervalo
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calcula a distância entre dois pontos
 */
export function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * Gera um número aleatório entre min e max
 */
export function random(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

/**
 * Verifica se um ponto está dentro de um círculo
 */
export function pointInCircle(px: number, py: number, cx: number, cy: number, radius: number): boolean {
  const distanceSquared = Math.pow(px - cx, 2) + Math.pow(py - cy, 2)
  return distanceSquared <= Math.pow(radius, 2)
}
