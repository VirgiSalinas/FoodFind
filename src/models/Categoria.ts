import { Schema, model } from 'mongoose';

export interface ICategoria {
  nombre: string;
  icono?: string;
}

const categoriaSchema = new Schema<ICategoria>(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre de la categoría es obligatorio'],
      unique: true,
      trim: true,
      maxlength: 50
    },

    // Nombre del ícono que usa el frontend (por ejemplo "hamburguesa")
    icono: {
      type: String,
      trim: true
    }
  },
  {
    collection: 'categorias',
    timestamps: true
  }
);

export const Categoria = model<ICategoria>('Categoria', categoriaSchema);
