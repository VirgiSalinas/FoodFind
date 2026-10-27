import { Router } from 'express';
import {
  actualizarPuntuacion,
  crearPuntuacion,
  eliminarPuntuacion,
  obtenerMiPuntuacion,
  obtenerPuntuaciones
} from '../controllers/puntuacionController.js';
import { verificarToken } from '../middlewares/auth.js';
import { validarId } from '../middlewares/validarId.js';

const router = Router();

// Pública
router.get('/', obtenerPuntuaciones);

// Con token ("/mia" va antes de cualquier ruta con :id)
router.get('/mia', verificarToken, obtenerMiPuntuacion);
router.post('/', verificarToken, crearPuntuacion);
router.put('/:id', verificarToken, validarId, actualizarPuntuacion);
router.delete('/:id', verificarToken, validarId, eliminarPuntuacion);

export default router;
