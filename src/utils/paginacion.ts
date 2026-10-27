export interface Paginacion {
  pagina: number;
  limite: number;
  saltar: number;
}

const LIMITE_POR_DEFECTO = 10;
const LIMITE_MAXIMO = 50;

// Lee ?pagina= y ?limite= de la URL con valores seguros por defecto
export const leerPaginacion = (query: Record<string, unknown>): Paginacion => {
  const pagina = Math.max(1, Number.parseInt(String(query.pagina ?? '1'), 10) || 1);
  const limitePedido = Number.parseInt(String(query.limite ?? LIMITE_POR_DEFECTO), 10) || LIMITE_POR_DEFECTO;
  const limite = Math.min(Math.max(1, limitePedido), LIMITE_MAXIMO);

  return { pagina, limite, saltar: (pagina - 1) * limite };
};

export const armarRespuestaPaginada = <T>(datos: T[], total: number, { pagina, limite }: Paginacion) => ({
  datos,
  pagina,
  limite,
  total,
  totalPaginas: Math.ceil(total / limite)
});
