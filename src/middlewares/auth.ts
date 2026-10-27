import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import type { Rol, UsuarioToken } from '../types/index.js';

// Revisa el header "Authorization: Bearer TOKEN" y deja los datos del usuario en req.usuario
export const verificarToken = (req: Request, res: Response, next: NextFunction) => {
  const autorizacion = req.headers.authorization;

  if (!autorizacion) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }

  const [tipo, token] = autorizacion.split(' ');

  if (tipo !== 'Bearer' || !token) {
    return res.status(401).json({ mensaje: 'Formato de token inválido' });
  }

  try {
    const datos = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] }) as Partial<UsuarioToken>;

    if (!datos.id || !datos.rol) {
      return res.status(401).json({ mensaje: 'Token inválido o expirado' });
    }

    req.usuario = { id: datos.id, rol: datos.rol };
    next();
  } catch {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

// Se usa siempre después de verificarToken
export const permitirRoles =
  (...roles: Rol[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      return res.status(403).json({ mensaje: 'No tenés permiso para realizar esta acción' });
    }

    next();
  };

export const soloAdmin = [verificarToken, permitirRoles('admin')];
