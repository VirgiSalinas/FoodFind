import { app } from './app.js';
import { conectarDB } from './config/db.js';
import { config } from './config/env.js';

// Punto de entrada: conecta a MongoDB y después levanta el servidor
const iniciarServidor = async () => {
  try {
    await conectarDB();

    app.listen(config.port, () => {
      console.log(`Servidor funcionando en http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
};

iniciarServidor();
