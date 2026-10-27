import { Schema, model } from 'mongoose';

// Los locales son ficticios: los carga el grupo, no vienen de ninguna API externa.
export interface ILocal {
  nombre: string;
  direccion: string;
  descripcion?: string;
  whatsapp?: string;
  instagram?: string;
  portada?: string;
}

const localSchema = new Schema<ILocal>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del local es obligatorio'],
      trim: true,
      maxlength: 100
    },

    // Dirección escrita como texto, sin coordenadas
    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true
    },

    descripcion: {
      type: String,
      trim: true,
      maxlength: 300
    },

    whatsapp: {
      type: String,
      trim: true
    },

    instagram: {
      type: String,
      trim: true
    },

    // Única imagen del sistema: una URL o una ruta de la carpeta pública del frontend
    portada: {
      type: String,
      trim: true,
      match: [/^(https?:\/\/|\/)\S+$/, 'La portada debe ser una URL o una ruta que empiece con /']
    }
  },
  {
    collection: 'locales',
    timestamps: true
  }
);

export const Local = model<ILocal>('Local', localSchema);
