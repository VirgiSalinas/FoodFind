import 'dotenv/config';

// Lee una variable de entorno obligatoria y corta la ejecución si falta,
// así el error aparece al arrancar y no en medio de un pedido.
const obligatoria = (nombre: string): string => {
  const valor = process.env[nombre];

  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}. Revisá tu archivo .env`);
  }

  return valor;
};

export const config = {
  port: Number(process.env.PORT) || 3000,
  mongoUri: obligatoria('MONGO_URI'),
  jwtSecret: obligatoria('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigin: process.env.CORS_ORIGIN || ''
};
