import type { NextFunction, Request, Response } from 'express';
import { esIdValido } from '../utils/validaciones.js';

// Revisa que el :id de la ruta sea un ObjectId válido antes de consultar la base
export const validarId = (req: Request, res: Response, next: NextFunction) => {
  if (!esIdValido(req.params.id)) {
    return res.status(400).json({ mensaje: 'El ID no es válido' });
  }

  next();
};
