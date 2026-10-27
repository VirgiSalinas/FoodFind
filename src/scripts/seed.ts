// Carga datos ficticios de prueba: borra TODO y lo vuelve a crear.
// Uso: npm run seed
// Así los cinco integrantes tienen exactamente los mismos datos.
import bcrypt from 'bcrypt';
import { conectarDB, desconectarDB } from '../config/db.js';
import { Categoria } from '../models/Categoria.js';
import { Comida } from '../models/Comida.js';
import { Local } from '../models/Local.js';
import { Puntuacion } from '../models/Puntuacion.js';
import { Usuario } from '../models/Usuario.js';

// Contraseña de todos los usuarios de prueba (solo para desarrollo)
const PASSWORD_PRUEBA = 'Prueba1234';

const categorias = [
  { nombre: 'Hamburguesas', icono: 'hamburguesa' },
  { nombre: 'Pizzas', icono: 'pizza' },
  { nombre: 'Lomos', icono: 'lomo' },
  { nombre: 'Milanesas', icono: 'milanesa' }
];

// Locales inventados: no corresponden a comercios reales
const locales = [
  {
    nombre: 'Burger House',
    direccion: 'Av. Costanera 123, Corrientes',
    descripcion: 'Hamburguesas caseras a la parrilla frente al río.',
    whatsapp: '+54 9 379 400-0001',
    instagram: '@burgerhouse.ficticio',
    portada: '/portadas/burger-house.jpg'
  },
  {
    nombre: 'La Pizzería de Tito',
    direccion: 'Calle Falsa 742, Corrientes',
    descripcion: 'Pizza a la piedra y al molde desde hace veinte años.',
    whatsapp: '+54 9 379 400-0002',
    instagram: '@pizzeriadetito.ficticio',
    portada: '/portadas/pizzeria-de-tito.jpg'
  },
  {
    nombre: 'El Lomito Feliz',
    direccion: 'Pasaje Imaginario 55, Corrientes',
    descripcion: 'Lomos completos y sándwiches al paso.',
    whatsapp: '+54 9 379 400-0003',
    portada: '/portadas/el-lomito-feliz.jpg'
  },
  {
    nombre: 'Milanesas Doña Rosa',
    direccion: 'Av. Inventada 1500, Corrientes',
    descripcion: 'Milanesas gigantes de carne y de pollo.',
    instagram: '@donarosa.ficticio',
    portada: '/portadas/milanesas-dona-rosa.jpg'
  },
  {
    nombre: 'Esquina Gourmet',
    direccion: 'Calle Ejemplo 300, Corrientes',
    descripcion: 'Un poco de todo: hamburguesas, pizzas y milanesas.',
    whatsapp: '+54 9 379 400-0005',
    instagram: '@esquinagourmet.ficticio',
    portada: '/portadas/esquina-gourmet.jpg'
  },
  {
    nombre: 'Parada 24',
    direccion: 'Ruta Ficticia 12 km 3, Corrientes',
    descripcion: 'Abierto toda la noche: lomos y hamburguesas.',
    whatsapp: '+54 9 379 400-0006',
    portada: '/portadas/parada-24.jpg'
  }
];

// [local, categoría, nombre, descripción, precio]
const comidas: Array<[string, string, string, string, number]> = [
  ['Burger House', 'Hamburguesas', 'Hamburguesa Clásica', 'Pan casero, carne 150 g, queso cheddar, lechuga, tomate y salsa especial.', 8500],
  ['Burger House', 'Hamburguesas', 'Doble Cheddar', 'Doble carne, doble cheddar y panceta.', 11000],
  ['Burger House', 'Hamburguesas', 'Veggie', 'Medallón de lentejas, rúcula y tomate.', 8000],
  ['Burger House', 'Milanesas', 'Milanesa al Pan', 'Milanesa de carne en pan francés con lechuga y tomate.', 7500],
  ['La Pizzería de Tito', 'Pizzas', 'Muzzarella', 'Salsa de tomate, muzzarella y aceitunas.', 9000],
  ['La Pizzería de Tito', 'Pizzas', 'Napolitana', 'Muzzarella, tomate en rodajas y ajo.', 10500],
  ['La Pizzería de Tito', 'Pizzas', 'Fugazzeta', 'Rellena de muzzarella con cebolla.', 11500],
  ['El Lomito Feliz', 'Lomos', 'Lomo Completo', 'Lomo, jamón, queso, huevo, lechuga y tomate.', 12000],
  ['El Lomito Feliz', 'Lomos', 'Lomo Simple', 'Lomo con lechuga, tomate y mayonesa.', 9500],
  ['El Lomito Feliz', 'Hamburguesas', 'Hamburguesa Completa', 'Carne, jamón, queso y huevo.', 8800],
  ['Milanesas Doña Rosa', 'Milanesas', 'Milanesa Napolitana', 'Con salsa, jamón y queso gratinado.', 10000],
  ['Milanesas Doña Rosa', 'Milanesas', 'Milanesa de Pollo', 'Suprema empanada con limón.', 8500],
  ['Milanesas Doña Rosa', 'Milanesas', 'Milanesa a Caballo', 'Con dos huevos fritos.', 9500],
  ['Esquina Gourmet', 'Hamburguesas', 'Burger Gourmet', 'Carne de autor, queso azul y cebolla caramelizada.', 12500],
  ['Esquina Gourmet', 'Pizzas', 'Pizza Rúcula y Crudo', 'Muzzarella, jamón crudo y rúcula.', 13000],
  ['Esquina Gourmet', 'Milanesas', 'Milanesa Suiza', 'Con salsa blanca y queso.', 10500],
  ['Parada 24', 'Lomos', 'Lomo de la Casa', 'Lomo con provolone y morrones asados.', 12500],
  ['Parada 24', 'Hamburguesas', 'Hamburguesa Nocturna', 'Doble carne con huevo y papas.', 9800]
];

const usuarios = [
  { nombre: 'Admin FoodFind', email: 'admin@foodfind.test', rol: 'admin' as const },
  { nombre: 'Micaela R.', email: 'micaela@foodfind.test' },
  { nombre: 'Mateo S.', email: 'mateo@foodfind.test' },
  { nombre: 'Florencia T.', email: 'florencia@foodfind.test' },
  { nombre: 'Lucas P.', email: 'lucas@foodfind.test' },
  { nombre: 'Sofía G.', email: 'sofia@foodfind.test' },
  { nombre: 'Tomás A.', email: 'tomas@foodfind.test' }
];

const comentarios = [
  'Excelente sabor y muy buena atención, volvería sin dudarlo.',
  'Muy rica, aunque las papas llegaron un poco frías.',
  'La mejor que probé en Corrientes, súper recomendable.',
  'Rica, pero la salsa estaba un poco fuerte para mi gusto.',
  'Buena relación precio y calidad, porciones abundantes.',
  'Correcta, nada del otro mundo pero cumple.',
  'Llegó rápido y caliente, todo muy prolijo.'
];

const valores = [5, 4.5, 4, 3.5, 5, 4, 3, 4.5];

const sembrar = async () => {
  await conectarDB();

  console.log('Borrando datos anteriores...');
  await Promise.all([
    Puntuacion.deleteMany({}),
    Comida.deleteMany({}),
    Local.deleteMany({}),
    Categoria.deleteMany({}),
    Usuario.deleteMany({})
  ]);

  // Se crean los índices (por ejemplo, el único de usuario + comida)
  await Promise.all([Categoria, Local, Comida, Usuario, Puntuacion].map((modelo) => modelo.syncIndexes()));

  // 1. Lo que no depende de nada: categorías, locales y usuarios
  const categoriasCreadas = await Categoria.insertMany(categorias);
  const localesCreados = await Local.insertMany(locales);

  const passwordHash = await bcrypt.hash(PASSWORD_PRUEBA, 12);
  const usuariosCreados = await Usuario.insertMany(
    usuarios.map((usuario) => ({ ...usuario, password: passwordHash }))
  );

  const idCategoria = new Map(categoriasCreadas.map((c) => [c.nombre, c._id]));
  const idLocal = new Map(localesCreados.map((l) => [l.nombre, l._id]));

  // 2. Comidas, usando los IDs que se acaban de generar
  const comidasCreadas = await Comida.insertMany(
    comidas.map(([local, categoria, nombre, descripcion, precio]) => ({
      local: idLocal.get(local),
      categoria: idCategoria.get(categoria),
      nombre,
      descripcion,
      precio
    }))
  );

  // 3. Puntuaciones: cada usuario común puntúa algunas comidas, una sola vez cada una
  const comunes = usuariosCreados.filter((usuario) => usuario.rol !== 'admin');
  const puntuaciones = [];
  let paso = 0;

  for (const [i, comida] of comidasCreadas.entries()) {
    // Entre 2 y 6 puntuaciones por comida, para que haya promedios variados
    const cantidad = 2 + ((i * 3) % 5);

    for (let j = 0; j < cantidad; j++) {
      const usuario = comunes[(i + j) % comunes.length];
      puntuaciones.push({
        usuario: usuario._id,
        comida: comida._id,
        valor: valores[paso % valores.length],
        comentario: comentarios[paso % comentarios.length]
      });
      paso++;
    }
  }

  await Puntuacion.insertMany(puntuaciones);

  console.log(`Listo: ${categoriasCreadas.length} categorías, ${localesCreados.length} locales, ` +
    `${comidasCreadas.length} comidas, ${usuariosCreados.length} usuarios y ${puntuaciones.length} puntuaciones.`);
  console.log(`Usuarios de prueba: admin@foodfind.test (admin) y micaela@foodfind.test, entre otros.`);
  console.log(`Contraseña de todos: ${PASSWORD_PRUEBA}`);
};

sembrar()
  .catch((error) => {
    console.error('Error al cargar los datos:', error);
    process.exitCode = 1;
  })
  .finally(desconectarDB);
