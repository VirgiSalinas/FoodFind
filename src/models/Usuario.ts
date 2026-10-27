import { Schema, model } from 'mongoose';
import type { Rol } from '../types/index.js';

export interface IUsuario {
  nombre: string;
  email: string;
  password: string;
  rol: Rol;
}

const usuarioSchema = new Schema<IUsuario>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true,
      maxlength: 60
    },

    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'El email no es válido']
    },

    // Se guarda el hash de bcrypt. select: false = no se devuelve en las consultas
    password: {
      type: String,
      required: true,
      select: false
    },

    // Los usuarios se registran siempre como "usuario"; los admin se crean con el seed
    rol: {
      type: String,
      enum: ['usuario', 'admin'],
      default: 'usuario'
    }
  },
  {
    collection: 'usuarios',
    timestamps: true
  }
);

export const Usuario = model<IUsuario>('Usuario', usuarioSchema);
