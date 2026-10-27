import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { Categoria } from '../models/Categoria.js';
import { Comida } from '../models/Comida.js';
import { Local } from '../models/Local.js';
import { Puntuacion } from '../models/Puntuacion.js';
import {
  comidaDestacada,
  puntajeDeLocal,
  puntajesDeComidas,
  puntajesDeLocales
} from '../services/puntajeService.js';
import { HttpError } from '../utils/HttpError.js';
import { elegirCampos } from '../utils/campos.js';
import { armarRespuestaPaginada, leerPaginacion } from '../utils/paginacion.js';
import { leerIdOpcional } from '../utils/validaciones.js';

type ConId = Request<{ id: string }>;

const CAMPOS = ['nombre', 'direccion', 'descripcion', 'whatsapp', 'instagram', 'portada'] as const;

// IDs de todas las comidas de un local
const idsDeComidasDelLocal = async (localId: Types.ObjectId) =>
  (await Comida.find({ local: localId }, { _id: 1 }).lean()).map((comida) => comida._id);

const buscarLocalOFallar = async (id: string) => {
  const local = await Local.findById(id).lean();
  if (!local) throw HttpError.noEncontrado('El local no existe');
  return local;
};

// GET /api/locales?categoria=ID
// Con ?categoria devuelve solo los locales que tienen comidas de esa categoría
export const obtenerLocales = async (req: Request, res: Response) => {
  const categoria = leerIdOpcional(req.query.categoria, 'categoria');
  const filtro: Record<string, unknown> = {};

  if (categoria) {
    filtro._id = { $in: await Comida.distinct('local', { categoria }) };
  }

  const locales = await Local.find(filtro).sort({ nombre: 1 }).lean();
  const puntajes = await puntajesDeLocales(locales.map((local) => local._id));

  res.json(
    locales.map((local) => ({
      ...local,
      ...(puntajes.get(String(local._id)) ?? { promedio: null, totalPuntuaciones: 0 })
    }))
  );
};

// GET /api/locales/:id  (tarjeta del local: datos + "4.6 · 235 reseñas")
export const obtenerLocal = async (req: ConId, res: Response) => {
  const local = await buscarLocalOFallar(req.params.id);
  res.json({ ...local, ...(await puntajeDeLocal(local._id)) });
};

// GET /api/locales/:id/puntaje
export const obtenerPuntajeDeLocal = async (req: ConId, res: Response) => {
  const local = await buscarLocalOFallar(req.params.id);
  res.json({ local: local.nombre, ...(await puntajeDeLocal(local._id)) });
};

// GET /api/locales/:id/categorias  (desplegable "Tipo de comida")
export const obtenerCategoriasDeLocal = async (req: ConId, res: Response) => {
  const local = await buscarLocalOFallar(req.params.id);
  const ids = await Comida.distinct('categoria', { local: local._id });
  const categorias = await Categoria.find({ _id: { $in: ids } }).sort({ nombre: 1 });

  res.json(categorias);
};

// GET /api/locales/:id/comidas?categoria=ID  (desplegable "Plato específico")
export const obtenerComidasDeLocal = async (req: ConId, res: Response) => {
  const local = await buscarLocalOFallar(req.params.id);
  const categoria = leerIdOpcional(req.query.categoria, 'categoria');

  const filtro: Record<string, unknown> = { local: local._id };
  if (categoria) filtro.categoria = categoria;

  const comidas = await Comida.find(filtro).populate('categoria', 'nombre icono').sort({ nombre: 1 }).lean();
  const puntajes = await puntajesDeComidas(comidas.map((comida) => comida._id));

  res.json({
    local: local.nombre,
    totalComidas: comidas.length,
    comidas: comidas.map((comida) => ({
      ...comida,
      ...(puntajes.get(String(comida._id)) ?? { promedio: null, totalPuntuaciones: 0 })
    }))
  });
};

// GET /api/locales/:id/destacada?categoria=ID  (etiqueta "Más elegida")
export const obtenerComidaDestacada = async (req: ConId, res: Response) => {
  const local = await buscarLocalOFallar(req.params.id);
  const categoria = leerIdOpcional(req.query.categoria, 'categoria');
  const destacada = await comidaDestacada(String(local._id), categoria);

  if (!destacada) {
    throw HttpError.noEncontrado('Este local todavía no tiene comidas puntuadas');
  }

  res.json(destacada);
};

// GET /api/locales/:id/puntuaciones?pagina=1&limite=10  ("Reseñas de este local")
export const obtenerPuntuacionesDeLocal = async (req: ConId, res: Response) => {
  const local = await buscarLocalOFallar(req.params.id);
  const paginacion = leerPaginacion(req.query);
  const comidaIds = await idsDeComidasDelLocal(local._id);
  const filtro = { comida: { $in: comidaIds } };

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

// POST /api/locales (admin)
export const crearLocal = async (req: Request, res: Response) => {
  const local = await Local.create(elegirCampos(req.body, CAMPOS));
  res.status(201).json(local);
};

// PUT /api/locales/:id (admin)
export const actualizarLocal = async (req: ConId, res: Response) => {
  const local = await Local.findByIdAndUpdate(req.params.id, elegirCampos(req.body, CAMPOS), {
    new: true,
    runValidators: true
  });

  if (!local) throw HttpError.noEncontrado('El local no existe');
  res.json(local);
};

// DELETE /api/locales/:id (admin)
// Borra en cascada: el local, sus comidas y las puntuaciones de esas comidas
export const eliminarLocal = async (req: ConId, res: Response) => {
  const local = await buscarLocalOFallar(req.params.id);
  const comidaIds = await idsDeComidasDelLocal(local._id);

  const { deletedCount: puntuacionesBorradas } = await Puntuacion.deleteMany({ comida: { $in: comidaIds } });
  const { deletedCount: comidasBorradas } = await Comida.deleteMany({ local: local._id });
  await Local.deleteOne({ _id: local._id });

  res.json({ mensaje: 'Local eliminado correctamente', comidasBorradas, puntuacionesBorradas });
};
