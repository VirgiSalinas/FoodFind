import { Types } from 'mongoose';
import { Comida } from '../models/Comida.js';
import { Puntuacion } from '../models/Puntuacion.js';
import { redondear } from '../utils/validaciones.js';

export interface Puntaje {
  promedio: number | null;
  totalPuntuaciones: number;
}

const SIN_PUNTAJE: Puntaje = { promedio: null, totalPuntuaciones: 0 };

const aObjectIds = (ids: Array<string | Types.ObjectId>) => ids.map((id) => new Types.ObjectId(String(id)));

// Promedio y cantidad de puntuaciones de varias comidas, en una sola consulta.
// Devuelve un Map: ID de comida -> puntaje
export const puntajesDeComidas = async (
  comidaIds: Array<string | Types.ObjectId>
): Promise<Map<string, Puntaje>> => {
  const resultado = await Puntuacion.aggregate<{ _id: Types.ObjectId; promedio: number; total: number }>([
    { $match: { comida: { $in: aObjectIds(comidaIds) } } },
    { $group: { _id: '$comida', promedio: { $avg: '$valor' }, total: { $sum: 1 } } }
  ]);

  return new Map(
    resultado.map((fila) => [
      String(fila._id),
      { promedio: redondear(fila.promedio), totalPuntuaciones: fila.total }
    ])
  );
};

export const puntajeDeComida = async (comidaId: string | Types.ObjectId): Promise<Puntaje> => {
  const puntajes = await puntajesDeComidas([comidaId]);
  return puntajes.get(String(comidaId)) ?? SIN_PUNTAJE;
};

// Puntaje de cada local: promedio de TODAS las puntuaciones de todas sus comidas
// (no el promedio de los promedios). Primero se buscan las comidas de los locales
// y después se agrupan sus puntuaciones por local.
export const puntajesDeLocales = async (
  localIds: Array<string | Types.ObjectId>
): Promise<Map<string, Puntaje>> => {
  const comidas = await Comida.find({ local: { $in: aObjectIds(localIds) } }, { local: 1 }).lean();
  const localDeComida = new Map(comidas.map((comida) => [String(comida._id), String(comida.local)]));

  const porComida = await Puntuacion.aggregate<{ _id: Types.ObjectId; suma: number; total: number }>([
    { $match: { comida: { $in: comidas.map((comida) => comida._id) } } },
    { $group: { _id: '$comida', suma: { $sum: '$valor' }, total: { $sum: 1 } } }
  ]);

  // Se suman las puntuaciones de las comidas de cada local
  const acumulado = new Map<string, { suma: number; total: number }>();
  for (const fila of porComida) {
    const localId = localDeComida.get(String(fila._id));
    if (!localId) continue;
    const previo = acumulado.get(localId) ?? { suma: 0, total: 0 };
    acumulado.set(localId, { suma: previo.suma + fila.suma, total: previo.total + fila.total });
  }

  return new Map(
    [...acumulado].map(([localId, { suma, total }]) => [
      localId,
      { promedio: redondear(suma / total), totalPuntuaciones: total }
    ])
  );
};

export const puntajeDeLocal = async (localId: string | Types.ObjectId): Promise<Puntaje> => {
  const puntajes = await puntajesDeLocales([localId]);
  return puntajes.get(String(localId)) ?? SIN_PUNTAJE;
};

// Comida "más elegida" de un local (opcionalmente dentro de una categoría):
// la que tiene más puntuaciones; si empatan, la de mejor promedio.
export const comidaDestacada = async (localId: string, categoriaId?: string) => {
  const filtro: Record<string, unknown> = { local: localId };
  if (categoriaId) filtro.categoria = categoriaId;

  const comidas = await Comida.find(filtro, { _id: 1 }).lean();
  if (comidas.length === 0) return null;

  const [ganadora] = await Puntuacion.aggregate<{ _id: Types.ObjectId; promedio: number; total: number }>([
    { $match: { comida: { $in: comidas.map((comida) => comida._id) } } },
    { $group: { _id: '$comida', promedio: { $avg: '$valor' }, total: { $sum: 1 } } },
    { $sort: { total: -1, promedio: -1 } },
    { $limit: 1 }
  ]);

  if (!ganadora) return null;

  const comida = await Comida.findById(ganadora._id).populate('categoria', 'nombre icono').lean();

  return comida
    ? { ...comida, promedio: redondear(ganadora.promedio), totalPuntuaciones: ganadora.total }
    : null;
};
