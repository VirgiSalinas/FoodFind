// Se queda solo con los campos permitidos del cuerpo del pedido.
// Evita que alguien mande campos de más (por ejemplo "rol": "admin").
export const elegirCampos = <K extends string>(cuerpo: unknown, permitidos: readonly K[]) => {
  const origen = (typeof cuerpo === 'object' && cuerpo !== null ? cuerpo : {}) as Record<string, unknown>;
  // Los tipos los valida después el esquema de Mongoose
  const resultado: Partial<Record<K, any>> = {};

  for (const campo of permitidos) {
    if (origen[campo] !== undefined) resultado[campo] = origen[campo];
  }

  return resultado;
};
