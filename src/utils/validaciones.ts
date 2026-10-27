import mongoose from 'mongoose';
import { HttpError } from './HttpError.js';

export const PUNTUACION_MIN = 0.5;
export const PUNTUACION_MAX = 5;
export const COMENTARIO_MIN = 10;
export const COMENTARIO_MAX = 500;

export const esIdValido = (valor: unknown): valor is string =>
  typeof valor === 'string' && mongoose.isValidObjectId(valor) && /^[a-f\d]{24}$/i.test(valor);

// Para filtros opcionales de la URL, por ejemplo ?categoria=ID
export const leerIdOpcional = (valor: unknown, nombre: string): string | undefined => {
  if (valor === undefined || valor === '') return undefined;

  if (!esIdValido(valor)) {
    throw HttpError.badRequest(`El filtro ${nombre} no es un ID válido`);
  }

  return valor;
};

// La puntuación va de 0,5 a 5 en pasos de 0,5 (como el selector del wireframe)
export const esPuntuacionValida = (valor: unknown): valor is number =>
  typeof valor === 'number' &&
  valor >= PUNTUACION_MIN &&
  valor <= PUNTUACION_MAX &&
  Number.isInteger(valor * 2);

export const validarPuntuacion = (valor: unknown): number => {
  if (!esPuntuacionValida(valor)) {
    throw HttpError.badRequest('La puntuación debe ser un número entre 0.5 y 5, en pasos de 0.5');
  }

  return valor;
};

export const validarComentario = (comentario: unknown): string => {
  if (typeof comentario !== 'string') {
    throw HttpError.badRequest('El comentario es obligatorio y debe ser un texto');
  }

  const limpio = comentario.trim();

  if (limpio.length < COMENTARIO_MIN || limpio.length > COMENTARIO_MAX) {
    throw HttpError.badRequest(
      `El comentario debe tener entre ${COMENTARIO_MIN} y ${COMENTARIO_MAX} caracteres`
    );
  }

  return limpio;
};

export const redondear = (valor: number | null): number | null =>
  valor === null ? null : Math.round(valor * 10) / 10;
