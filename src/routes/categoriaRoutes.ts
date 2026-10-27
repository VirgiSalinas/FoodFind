import { Router } from 'express';
import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  obtenerCategoria,
  obtenerCategorias
} from '../controllers/categoriaController.js';
import { soloAdmin } from '../middlewares/auth.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

// Públicas
router.get('/', obtenerCategorias);
router.get('/:id', validarId, obtenerCategoria);

// Solo admin
router.post('/', soloAdmin, crearCategoria);
router.put('/:id', soloAdmin, validarId, actualizarCategoria);
router.delete('/:id', soloAdmin, validarId, eliminarCategoria);

export default router;
