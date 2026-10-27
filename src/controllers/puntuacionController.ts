import type { Request, Response } from 'express';
import { Comida } from '../models/Comida.js';
import { Puntuacion } from '../models/Puntuacion.js';
import { HttpError } from '../utils/HttpError.js';
import { armarRespuestaPaginada, leerPaginacion } from '../utils/paginacion.js';
import { esIdValido, leerIdOpcional, validarComentario, validarPuntuacion } from '../utils/validaciones.js';

type ConId = Request<{ id: string }>;

// verificarToken ya corrió antes, así que req.usuario existe
const usuarioActual = (req: Request) => {
  if (!req.usuario) throw new HttpError(401, 'Token no proporcionado');
  return req.usuario;
};

const buscarPuntuacionOFallar = async (id: string) => {
  const puntuacion = await Puntuacion.findById(id);
  if (!puntuacion) throw HttpError.noEncontrado('La puntuación no existe');
  return puntuacion;
};

// GET /api/puntuaciones?comida=ID&usuario=ID&pagina=1&limite=10
export const obtenerPuntuaciones = async (req: Request, res: Response) => {
  const comida = leerIdOpcional(req.query.comida, 'comida');
  const usuario = leerIdOpcional(req.query.usuario, 'usuario');
  const paginacion = leerPaginacion(req.query);

  const filtro: Record<string, unknown> = {};
  if (comida) filtro.comida = comida;
  if (usuario) filtro.usuario = usuario;

  const [puntuaciones, total] = await Promise.all([
    Puntuacion.find(filtro)
      .sort({ createdAt: -1 })
      .skip(paginacion.saltar)
      .limit(paginacion.limite)
      .populate('usuario', 'nombre')
      .populate('comida', 'nombre'),
    Puntuacion.countDocuments(filtro)
  ]);

  res.json(armarRespuestaPaginada(puntuaciones, total, paginacion));
};

// GET /api/puntuaciones/mia?comida=ID (con token)
// Sirve para que el frontend sepa si ya puntuaste una comida y muestre "Editar"
export const obtenerMiPuntuacion = async (req: Request, res: Response) => {
  const { id } = usuarioActual(req);
  const comida = leerIdOpcional(req.query.comida, 'comida');

  if (!comida) throw HttpError.badRequest('Falta el filtro ?comida=ID');

  const puntuacion = await Puntuacion.findOne({ usuario: id, comida });
  if (!puntuacion) throw HttpError.noEncontrado('Todavía no puntuaste esta comida');

  res.json(puntuacion);
};

// POST /api/puntuaciones (con token)
// El usuario sale del token, nunca del cuerpo del pedido
export const crearPuntuacion = async (req: Request, res: Response) => {
  const { id: usuario } = usuarioActual(req);
  const { comida, valor, comentario } = req.body ?? {};

  if (!esIdValido(comida)) throw HttpError.badRequest('ID de comida inválido');
  const valorValidado = validarPuntuacion(valor);
  const comentarioValidado = validarComentario(comentario);

  if (!(await Comida.exists({ _id: comida }))) throw HttpError.noEncontrado('La comida no existe');

  // Si el usuario ya puntuó esta comida, el índice único hace fallar el guardado
  // y el middleware de errores responde 409
  const puntuacion = await Puntuacion.create({
    usuario,
    comida,
    valor: valorValidado,
    comentario: comentarioValidado
  });

  res.status(201).json({ mensaje: 'Puntuación registrada correctamente', puntuacion });
};

// PUT /api/puntuaciones/:id (con token, solo el autor)
// Se puede cambiar el valor, el comentario o ambos
export const actualizarPuntuacion = async (req: ConId, res: Response) => {
  const { id: usuario } = usuarioActual(req);
  const { valor, comentario } = req.body ?? {};

  if (valor === undefined && comentario === undefined) {
    throw HttpError.badRequest('Enviá el valor, el comentario o ambos');
  }

  const puntuacion = await buscarPuntuacionOFallar(req.params.id);

  if (String(puntuacion.usuario) !== usuario) {
    throw new HttpError(403, 'No tenés permiso para modificar esta puntuación');
  }

  if (valor !== undefined) puntuacion.valor = validarPuntuacion(valor);
  if (comentario !== undefined) puntuacion.comentario = validarComentario(comentario);

  await puntuacion.save();
  res.json({ mensaje: 'Puntuación actualizada correctamente', puntuacion });
};

// DELETE /api/puntuaciones/:id (con token: el autor o un admin)
export const eliminarPuntuacion = async (req: ConId, res: Response) => {
  const { id: usuario, rol } = usuarioActual(req);
  const puntuacion = await buscarPuntuacionOFallar(req.params.id);

  if (String(puntuacion.usuario) !== usuario && rol !== 'admin') {
    throw new HttpError(403, 'No tenés permiso para eliminar esta puntuación');
  }

  await puntuacion.deleteOne();
  res.json({ mensaje: 'Puntuación eliminada correctamente' });
};
