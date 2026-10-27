// Error con código de estado HTTP. Los controladores lo lanzan con throw
// y el middleware de errores arma la respuesta (ver middlewares/errores.ts).
export class HttpError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'HttpError';
  }

  static badRequest(mensaje: string) {
    return new HttpError(400, mensaje);
  }

  static noEncontrado(mensaje: string) {
    return new HttpError(404, mensaje);
  }

  static conflicto(mensaje: string) {
    return new HttpError(409, mensaje);
  }
}
