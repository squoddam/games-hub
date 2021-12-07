import { Vector2 } from './types';

export const times = (num: number): number[] =>
  Array(num)
    .fill(null)
    .map((_, i) => i);

export function head<T>(arr: T[]): T {
  return arr[0];
}

export function tail<T>(arr: T[]): T[] {
  return arr.slice(1);
}

export function behead<T>(arr: T[]): [T, T[]] {
  return [head(arr), tail(arr)];
}

export function last<T>(arr: T[]): T {
  return arr[arr.length - 1];
}

export const pick =
  <T>(keys: string[]) =>
  (obj: T) =>
    Object.fromEntries(
      Object.entries(obj).filter(([key]) => keys.includes(key))
    );

export const hasDiffBy = <T extends Record<string, any>>(
  keys: string[],
  prev: T,
  next: T
) => keys.some((key) => prev[key] !== next[key]);

export const randMinMax = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min);

export const toFixed = (num: number, amount: number): number =>
  Number(num.toFixed(amount));
