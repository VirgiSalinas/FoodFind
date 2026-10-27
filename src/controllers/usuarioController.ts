import bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { config } from '../config/env.js';
import { Usuario } from '../models/Usuario.js';
import type { UsuarioToken } from '../types/index.js';
import { HttpError } from '../utils/HttpError.js';

const PASSWORD_MIN = 8;

const generarToken = (datos: UsuarioToken) =>
  jwt.sign(datos, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn as SignOptions['expiresIn']
  });

// POST /api/usuarios/registro
// El rol nunca se toma del cuerpo del pedido: todos se registran como "usuario"
export const registrarUsuario = async (req: Request, res: Response) => {
  const { nombre, email, password } = req.body ?? {};

  if (typeof nombre !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
    throw HttpError.badRequest('Nombre, email y contraseña son obligatorios');
  }

  if (password.length < PASSWORD_MIN) {
    throw HttpError.badRequest(`La contraseña debe tener al menos ${PASSWORD_MIN} caracteres`);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const usuario = await Usuario.create({ nombre, email, password: passwordHash });

  res.status(201).json({
    mensaje: 'Usuario registrado correctamente',
    usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
  });
};

// POST /api/usuarios/login
export const iniciarSesion = async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (typeof email !== 'string' || typeof password !== 'string') {
    throw HttpError.badRequest('Email y contraseña son obligatorios');
  }

  const usuario = await Usuario.findOne({ email: email.trim().toLowerCase() }).select('+password');

  // Mismo mensaje si no existe el email o si la contraseña es incorrecta
  if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
    throw new HttpError(401, 'Credenciales incorrectas');
  }

  const token = generarToken({ id: String(usuario._id), rol: usuario.rol });

  res.json({
    mensaje: 'Inicio de sesión correcto',
    token,
    usuario: { id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol }
  });
};

// GET /api/usuarios/perfil (con token)
export const obtenerPerfil = async (req: Request, res: Response) => {
  const usuario = await Usuario.findById(req.usuario?.id);
  if (!usuario) throw HttpError.noEncontrado('El usuario no existe');

  res.json({ id: usuario._id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol });
};
