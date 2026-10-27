import { Router } from 'express';
import {
  actualizarLocal,
  crearLocal,
  eliminarLocal,
  obtenerCategoriasDeLocal,
  obtenerComidaDestacada,
  obtenerComidasDeLocal,
  obtenerLocal,
  obtenerLocales,
  obtenerPuntajeDeLocal,
  obtenerPuntuacionesDeLocal
} from '../controllers/localController.js';
import { soloAdmin } from '../middlewares/auth.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

// Públicas
router.get('/', obtenerLocales);
router.get('/:id', validarId, obtenerLocal);
router.get('/:id/puntaje', validarId, obtenerPuntajeDeLocal);
router.get('/:id/categorias', validarId, obtenerCategoriasDeLocal);
router.get('/:id/comidas', validarId, obtenerComidasDeLocal);
router.get('/:id/destacada', validarId, obtenerComidaDestacada);
router.get('/:id/puntuaciones', validarId, obtenerPuntuacionesDeLocal);

// Solo admin
router.post('/', soloAdmin, crearLocal);
router.put('/:id', soloAdmin, validarId, actualizarLocal);
router.delete('/:id', soloAdmin, validarId, eliminarLocal);

export default router;
