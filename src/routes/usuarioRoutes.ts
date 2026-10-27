import { Router } from 'express';
import { iniciarSesion, obtenerPerfil, registrarUsuario } from '../controllers/usuarioController.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

router.post('/registro', registrarUsuario);
router.post('/login', iniciarSesion);
router.get('/perfil', verificarToken, obtenerPerfil);

export default router;
