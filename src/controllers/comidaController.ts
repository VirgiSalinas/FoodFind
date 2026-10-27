import type { Request, Response } from 'express';
import { Categoria } from '../models/Categoria.js';
import { Comida } from '../models/Comida.js';
import { Local } from '../models/Local.js';
import { Puntuacion } from '../models/Puntuacion.js';
import { puntajeDeComida, puntajesDeComidas } from '../services/puntajeService.js';
import { HttpError } from '../utils/HttpError.js';
import { elegirCampos } from '../utils/campos.js';
import { armarRespuestaPaginada, leerPaginacion } from '../utils/paginacion.js';
import { esIdValido, leerIdOpcional } from '../utils/validaciones.js';

type ConId = Request<{ id: string }>;

const CAMPOS = ['nombre', 'descripcion', 'precio', 'local', 'categoria'] as const;

const buscarComidaOFallar = async (id: string) => {
  const comida = await Comida.findById(id)
    .populate('local', 'nombre direccion')
    .populate('categoria', 'nombre icono')
    .lean();

  if (!comida) throw HttpError.noEncontrado('La comida no existe');
  return comida;
};

// MongoDB no impide guardar un ID que apunte a algo inexistente:
// por eso se comprueba acá que el local y la categoría existan.
const comprobarRelaciones = async (datos: { local?: unknown; categoria?: unknown }) => {
  if (datos.local !== undefined) {
    if (!esIdValido(datos.local)) throw HttpError.badRequest('El ID del local no es válido');
    if (!(await Local.exists({ _id: datos.local }))) throw HttpError.noEncontrado('El local no existe');
  }

  if (datos.categoria !== undefined) {
    if (!esIdValido(datos.categoria)) throw HttpError.badRequest('El ID de la categoría no es válido');
    if (!(await Categoria.exists({ _id: datos.categoria }))) {
      throw HttpError.noEncontrado('La categoría no existe');
    }
  }
};

// GET /api/comidas?local=ID&categoria=ID
export const obtenerComidas = async (req: Request, res: Response) => {
  const local = leerIdOpcional(req.query.local, 'local');
  const categoria = leerIdOpcional(req.query.categoria, 'categoria');

  const filtro: Record<string, unknown> = {};
  if (local) filtro.local = local;
  if (categoria) filtro.categoria = categoria;

  const comidas = await Comida.find(filtro)
    .populate('local', 'nombre direccion')
    .populate('categoria', 'nombre icono')
    .sort({ nombre: 1 })
    .lean();

  const puntajes = await puntajesDeComidas(comidas.map((comida) => comida._id));

  res.json(
    comidas.map((comida) => ({
      ...comida,
      ...(puntajes.get(String(comida._id)) ?? { promedio: null, totalPuntuaciones: 0 })
    }))
  );
};

// GET /api/comidas/:id
export const obtenerComida = async (req: ConId, res: Response) => {
  const comida = await buscarComidaOFallar(req.params.id);
  res.json({ ...comida, ...(await puntajeDeComida(comida._id)) });
};

// GET /api/comidas/:id/puntaje
export const obtenerPuntajeDeComida = async (req: ConId, res: Response) => {
  const comida = await buscarComidaOFallar(req.params.id);
  res.json({ comida: comida.nombre, ...(await puntajeDeComida(comida._id)) });
};

// GET /api/comidas/:id/puntuaciones?pagina=1&limite=10
export const obtenerPuntuacionesDeComida = async (req: ConId, res: Response) => {
  const comida = await buscarComidaOFallar(req.params.id);
  const paginacion = leerPaginacion(req.query);
  const filtro = { comida: comida._id };

  const [puntuaciones, total] = await Promise.all([
    Puntuacion.find(filtro)
      .sort({ createdAt: -1 })
      .skip(paginacion.saltar)
      .limit(paginacion.limite)
      .populate('usuario', 'nombre'),
    Puntuacion.countDocuments(filtro)
  ]);

  res.json(armarRespuestaPaginada(puntuaciones, total, paginacion));
};

// POST /api/comidas (admin)
export const crearComida = async (req: Request, res: Response) => {
  const datos = elegirCampos(req.body, CAMPOS);

  if (datos.local === undefined || datos.categoria === undefined) {
    throw HttpError.badRequest('El local y la categoría son obligatorios');
  }

  await comprobarRelaciones(datos);
  const comida = await Comida.create(datos);

  res.status(201).json(comida);
};

// PUT /api/comidas/:id (admin)
export const actualizarComida = async (req: ConId, res: Response) => {
  const datos = elegirCampos(req.body, CAMPOS);
  await comprobarRelaciones(datos);

  const comida = await Comida.findByIdAndUpdate(req.params.id, datos, { new: true, runValidators: true });

  if (!comida) throw HttpError.noEncontrado('La comida no existe');
  res.json(comida);
};

// DELETE /api/comidas/:id (admin)
// Borra también sus puntuaciones, para no dejar reseñas de una comida inexistente
export const eliminarComida = async (req: ConId, res: Response) => {
  const comida = await Comida.findById(req.params.id);
  if (!comida) throw HttpError.noEncontrado('La comida no existe');

  const { deletedCount: puntuacionesBorradas } = await Puntuacion.deleteMany({ comida: comida._id });
  await comida.deleteOne();

  res.json({ mensaje: 'Comida eliminada correctamente', puntuacionesBorradas });
};
