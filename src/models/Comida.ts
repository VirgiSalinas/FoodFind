import { Schema, model, Types } from 'mongoose';

export interface IComida {
  nombre: string;
  descripcion?: string;
  precio: number;
  local: Types.ObjectId;
  categoria: Types.ObjectId;
}

const comidaSchema = new Schema<IComida>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la comida es obligatorio'],
      trim: true,
      maxlength: 100
    },

    descripcion: {
      type: String,
      trim: true,
      maxlength: 300
    },

    precio: {
      type: Number,
      required: [true, 'El precio es obligatorio'],
      validate: {
        validator: (valor: number) => valor > 0,
        message: 'El precio debe ser mayor a 0'
      }
    },

    // Relaciones: se guarda solo el ID, nunca una copia de los datos
    local: {
      type: Schema.Types.ObjectId,
      ref: 'Local',
      required: [true, 'El local es obligatorio']
    },

    categoria: {
      type: Schema.Types.ObjectId,
      ref: 'Categoria',
      required: [true, 'La categoría es obligatoria']
    }
  },
  {
    collection: 'comidas',
    timestamps: true
  }
);

// Filtros más usados: comidas de un local y comidas de una categoría
comidaSchema.index({ local: 1, categoria: 1 });
comidaSchema.index({ categoria: 1 });

// Un local no puede tener dos comidas con el mismo nombre
comidaSchema.index({ local: 1, nombre: 1 }, { unique: true });

export const Comida = model<IComida>('Comida', comidaSchema);
