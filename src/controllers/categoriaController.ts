import type { Request, Response } from 'express';
import { Categoria } from '../models/Categoria.js';
import { Comida } from '../models/Comida.js';
import { HttpError } from '../utils/HttpError.js';
import { elegirCampos } from '../utils/campos.js';

const CAMPOS = ['nombre', 'icono'] as const;

export const buscarCategoriaOFallar = async (id: string) => {
  const categoria = await Categoria.findById(id);
  if (!categoria) throw HttpError.noEncontrado('La categoría no existe');
  return categoria;
};

// GET /api/categorias
export const obtenerCategorias = async (_req: Request, res: Response) => {
  const categorias = await Categoria.find().sort({ nombre: 1 });
  res.json(categorias);
};

// GET /api/categorias/:id
export const obtenerCategoria = async (req: Request<{ id: string }>, res: Response) => {
  res.json(await buscarCategoriaOFallar(req.params.id));
};

// POST /api/categorias (admin)
export const crearCategoria = async (req: Request, res: Response) => {
  const categoria = await Categoria.create(elegirCampos(req.body, CAMPOS));
  res.status(201).json(categoria);
};

// PUT /api/categorias/:id (admin)
export const actualizarCategoria = async (req: Request<{ id: string }>, res: Response) => {
  const categoria = await Categoria.findByIdAndUpdate(req.params.id, elegirCampos(req.body, CAMPOS), {
    new: true,
    runValidators: true
  });

  if (!categoria) throw HttpError.noEncontrado('La categoría no existe');
  res.json(categoria);
};

// DELETE /api/categorias/:id (admin)
// No se puede borrar una categoría que todavía tiene comidas
export const eliminarCategoria = async (req: Request<{ id: string }>, res: Response) => {
  const categoria = await buscarCategoriaOFallar(req.params.id);
  const comidasQueLaUsan = await Comida.countDocuments({ categoria: categoria._id });

  if (comidasQueLaUsan > 0) {
    throw HttpError.conflicto(
      `No se puede borrar: hay ${comidasQueLaUsan} comida(s) en esta categoría`
    );
  }

  await categoria.deleteOne();
  res.json({ mensaje: 'Categoría eliminada correctamente' });
};
