import { Router } from 'express';
import {
  actualizarComida,
  crearComida,
  eliminarComida,
  obtenerComida,
  obtenerComidas,
  obtenerPuntajeDeComida,
  obtenerPuntuacionesDeComida
} from '../controllers/comidaController.js';
import { soloAdmin } from '../middlewares/auth.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

// Públicas
router.get('/', obtenerComidas);
router.get('/:id', validarId, obtenerComida);
router.get('/:id/puntaje', validarId, obtenerPuntajeDeComida);
router.get('/:id/puntuaciones', validarId, obtenerPuntuacionesDeComida);

// Solo admin
router.post('/', soloAdmin, crearComida);
router.put('/:id', soloAdmin, validarId, actualizarComida);
router.delete('/:id', soloAdmin, validarId, eliminarComida);

export default router;
