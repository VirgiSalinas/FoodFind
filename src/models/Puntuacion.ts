import { Schema, model, Types } from 'mongoose';
import {
  COMENTARIO_MAX,
  COMENTARIO_MIN,
  PUNTUACION_MAX,
  PUNTUACION_MIN,
  esPuntuacionValida
} from '../utils/validaciones.js';

// Una puntuación es la reseña de un usuario sobre una comida
export interface IPuntuacion {
  usuario: Types.ObjectId;
  comida: Types.ObjectId;
  valor: number;
  comentario: string;
  createdAt: Date;
  updatedAt: Date;
}

const puntuacionSchema = new Schema<IPuntuacion>(
  {
    usuario: {
      type: Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true
    },

    comida: {
      type: Schema.Types.ObjectId,
      ref: 'Comida',
      required: true
    },

    // De 0,5 a 5 en pasos de 0,5
    valor: {
      type: Number,
      required: true,
      min: PUNTUACION_MIN,
      max: PUNTUACION_MAX,
      validate: {
        validator: esPuntuacionValida,
        message: 'La puntuación debe ir en pasos de 0.5'
      }
    },

    comentario: {
      type: String,
      required: [true, 'El comentario es obligatorio'],
      trim: true,
      minlength: COMENTARIO_MIN,
      maxlength: COMENTARIO_MAX
    }
  },
  {
    collection: 'puntuaciones',
    // createdAt y updatedAt automáticos: de acá sale el "Hace 2 días"
    timestamps: true
  }
);

// Una sola puntuación por usuario y comida
puntuacionSchema.index({ usuario: 1, comida: 1 }, { unique: true });

// Para listar y promediar las puntuaciones de una comida
puntuacionSchema.index({ comida: 1, createdAt: -1 });

export const Puntuacion = model<IPuntuacion>('Puntuacion', puntuacionSchema);
