import type { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { HttpError } from '../utils/HttpError.js';

// Mensajes para los datos duplicados, según el índice único que falló
const mensajeDuplicado = (campos: string[]): string => {
  if (campos.includes('email')) return 'El correo ya está registrado';
  if (campos.includes('usuario') && campos.includes('comida')) {
    return 'Ya puntuaste esta comida. Podés editar tu puntuación';
  }
  if (campos.includes('nombre')) return 'Ya existe un registro con ese nombre';
  return 'El dato ya existe';
};

// Para las rutas que no existen
export const rutaNoEncontrada = (req: Request, res: Response) => {
  res.status(404).json({ mensaje: `No existe la ruta ${req.method} ${req.originalUrl}` });
};

// Middleware de errores: va último en app.ts. Express 5 manda acá los errores
// de las funciones async automáticamente, sin try/catch en cada controlador.
export const manejadorErrores = (error: unknown, req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ mensaje: error.message });
  }

  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      mensaje: 'Los datos enviados no son válidos',
      errores: Object.values(error.errors).map((detalle) => detalle.message)
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ mensaje: `El valor de ${error.path} no es válido` });
  }

  // Error de clave duplicada de MongoDB (índice único)
  if (typeof error === 'object' && error !== null && 'code' in error && error.code === 11000) {
    const campos = Object.keys((error as { keyPattern?: object }).keyPattern ?? {});
    return res.status(409).json({ mensaje: mensajeDuplicado(campos) });
  }

  // JSON mal escrito en el cuerpo del pedido
  if (typeof error === 'object' && error !== null && 'type' in error && error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensaje: 'El cuerpo del pedido no es un JSON válido' });
  }

  console.error(error);
  res.status(500).json({ mensaje: 'Error interno del servidor' });
};
