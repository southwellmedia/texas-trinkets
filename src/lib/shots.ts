/**
 * Helpers for "shots" — product photos that may contain several pieces.
 */
import { getCollection, type CollectionEntry } from 'astro:content';

export type Shot = CollectionEntry<'products'>;

export interface Piece {
  id: string;
  name: string;
  details?: string;
  price?: string;
  status: Shot['data']['status'];
  x: number;
  y: number;
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

/** Pieces in a shot; a shot with no listed pieces is treated as one piece. */
export function piecesOf(shot: Shot): Piece[] {
  const { data } = shot;
  const list = data.pieces.length
    ? data.pieces
    : [{ name: data.name, details: data.details, price: data.priceRange, x: 50, y: 50 }];
  return list.map((p) => ({
    status: data.status,
    ...p,
    id: `${shot.id}--${slugify(p.name)}`,
  }));
}

export async function getShots(): Promise<Shot[]> {
  const shots = await getCollection('products', ({ data }) => data.featured);
  return shots.sort((a, b) => a.data.order - b.data.order);
}

export type Category = Shot['data']['category'];

/** Shop filter chips, in display order */
export const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'jewelry', label: 'Jewelry' },
  { key: 'earrings', label: 'Earrings' },
  { key: 'hats', label: 'Trucker Hats' },
  { key: 'beanies', label: 'Beanies' },
];
