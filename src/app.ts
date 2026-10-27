import cors from 'cors';
import express from 'express';
import { config } from './config/env.js';
import { manejadorErrores, rutaNoEncontrada } from './middlewares/errores.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import comidaRoutes from './routes/comidaRoutes.js';
import localRoutes from './routes/localRoutes.js';
import puntuacionRoutes from './routes/puntuacionRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';

// Arma la aplicación de Express: middlewares y rutas.
// No se conecta a la base ni abre el puerto (eso lo hace server.ts),
// así se puede importar en tests sin levantar el servidor.
export const app = express();

// 1. Middlewares generales
// Con CORS_ORIGIN vacío se permite cualquier origen (solo para desarrollo)
app.use(cors(config.corsOrigin ? { origin: config.corsOrigin.split(',') } : undefined));
app.use(express.json());

// 2. Rutas
app.get('/', (_req, res) => {
  res.send('Bienvenido a la API de FoodFind');
});

app.get('/api/salud', (_req, res) => {
  res.json({ estado: 'ok' });
});

app.use('/api/categorias', categoriaRoutes);
app.use('/api/locales', localRoutes);
app.use('/api/comidas', comidaRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/puntuaciones', puntuacionRoutes);

// 3. Errores: siempre al final
app.use(rutaNoEncontrada);
app.use(manejadorErrores);
