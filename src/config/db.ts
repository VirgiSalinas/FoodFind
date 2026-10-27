import mongoose from 'mongoose';
import { config } from './env.js';

export const conectarDB = async (): Promise<void> => {
  await mongoose.connect(config.mongoUri);
  console.log('MongoDB conectado correctamente');
};

export const desconectarDB = async (): Promise<void> => {
  await mongoose.disconnect();
};
