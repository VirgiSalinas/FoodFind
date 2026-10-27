export type Rol = 'usuario' | 'admin';

// Datos del usuario que viajan dentro del token y quedan en req.usuario
export interface UsuarioToken {
  id: string;
  rol: Rol;
}
