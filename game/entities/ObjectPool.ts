/**
 * Implementação genérica de um pool de objetos
 * para reutilizar instâncias e evitar alocações dinâmicas frequentes
 */
export class ObjectPool<T> {
  private pool: T[];
  private factory: () => T;
  private reset: (obj: T) => void;
  private maxSize: number;

  /**
   * @param factory Função para criar novos objetos
   * @param reset Função para reinicializar objetos existentes
   * @param initialSize Quantidade inicial de objetos no pool
   * @param maxSize Tamanho máximo do pool
   */
  constructor(
    factory: () => T,
    reset: (obj: T) => void,
    initialSize: number = 0,
    maxSize: number = 100
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxSize = maxSize;
    this.pool = [];

    // Pré-popula o pool com a quantidade inicial
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  /**
   * Obtém um objeto do pool.
   * Se o pool estiver vazio, cria um novo objeto.
   */
  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop() as T;
    } else {
      return this.factory();
    }
  }

  /**
   * Devolve um objeto ao pool para ser reutilizado.
   * O objeto é reinicializado antes de voltar ao pool.
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.reset(obj);
      this.pool.push(obj);
    }
  }

  /**
   * Limpa o pool, removendo todos os objetos
   */
  clear(): void {
    this.pool = [];
  }

  /**
   * Redimensiona o pool para um novo tamanho máximo
   */
  resize(newMaxSize: number): void {
    this.maxSize = newMaxSize;
    // Se o novo tamanho for menor que o atual, remove os objetos excedentes
    while (this.pool.length > this.maxSize) {
      this.pool.pop();
    }
  }

  /**
   * Retorna o número de objetos disponíveis no pool
   */
  getAvailableCount(): number {
    return this.pool.length;
  }

  /**
   * Pré-aloca objetos no pool
   */
  preallocate(count: number): void {
    const toCreate = Math.min(count, this.maxSize - this.pool.length);
    for (let i = 0; i < toCreate; i++) {
      this.pool.push(this.factory());
    }
  }
}
