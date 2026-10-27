import type { UsuarioToken } from './index.js';

// Le agrega a Request de Express el campo usuario que completa verificarToken
declare global {
  namespace Express {
    interface Request {
      usuario?: UsuarioToken;
    }
  }
}

export {};
