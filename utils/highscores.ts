/**
 * Sistema de pontuações máximas (high scores)
 * Armazena as melhores pontuações do jogador usando localStorage
 */

// Interface para representar uma pontuação
export interface HighScore {
  score: number;
  level: number;
  date: string;
}

// Chave para armazenamento no localStorage
const HIGH_SCORES_KEY = 'minijam2_highscores';

// Número máximo de pontuações armazenadas
const MAX_HIGH_SCORES = 10;

/**
 * Obtém todas as pontuações armazenadas
 */
export function getHighScores(): HighScore[] {
  if (typeof window === 'undefined') return []; // Verifica se estamos no navegador
  
  try {
    const scoresJson = localStorage.getItem(HIGH_SCORES_KEY);
    if (!scoresJson) return [];
    
    const scores = JSON.parse(scoresJson);
    return Array.isArray(scores) ? scores : [];
  } catch (error) {
    console.error('Erro ao carregar pontuações:', error);
    return [];
  }
}

/**
 * Adiciona uma nova pontuação ao registro
 * Retorna verdadeiro se a pontuação for um novo recorde
 */
export function addHighScore(score: number, level: number): boolean {
  if (typeof window === 'undefined') return false; // Verifica se estamos no navegador
  
  try {
    const scores = getHighScores();
    const newScore: HighScore = {
      score,
      level,
      date: new Date().toISOString()
    };
    
    // Verifica se é uma nova pontuação máxima
    const isNewHighScore = scores.length === 0 || scores.some(s => newScore.score > s.score);
    
    // Adiciona a nova pontuação e ordena
    scores.push(newScore);
    scores.sort((a, b) => b.score - a.score); // Ordena em ordem decrescente
    
    // Limita ao número máximo de pontuações
    const trimmedScores = scores.slice(0, MAX_HIGH_SCORES);
    
    // Salva no localStorage
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(trimmedScores));
    
    return isNewHighScore;
  } catch (error) {
    console.error('Erro ao salvar pontuação:', error);
    return false;
  }
}

/**
 * Limpa todas as pontuações armazenadas
 */
export function clearHighScores(): void {
  if (typeof window === 'undefined') return; // Verifica se estamos no navegador
  
  try {
    localStorage.removeItem(HIGH_SCORES_KEY);
  } catch (error) {
    console.error('Erro ao limpar pontuações:', error);
  }
}

/**
 * Verifica se uma pontuação está entre as melhores
 */
export function isHighScore(score: number): boolean {
  const scores = getHighScores();
  
  if (scores.length < MAX_HIGH_SCORES) {
    return true; // Se temos menos que o máximo, qualquer pontuação entra
  }
  
  // Verifica se a nova pontuação é maior que a menor da lista
  return score > Math.min(...scores.map(s => s.score));
}
