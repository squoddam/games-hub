import { Vector2 } from "./types";

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

export const indexToGrid = (index: number, gridSize: number): Vector2 =>
  [index % gridSize, Math.floor(index / gridSize)] as Vector2;

export const gridToIndex = ([c, r]: Vector2, gridSize: number): number =>
  r * gridSize + c;

export const getKey = (point: Vector2): string => point.join("-");

export const keyToVector = (pointKey: string): Vector2 =>
  pointKey.split("-").map(Number) as Vector2;

export const getNeighbors = ([x, y]: Vector2, gridSize: number): Vector2[] =>
  times(9).reduce<Vector2[]>((acc, i) => {
    const nX = (i % 3) + x - 1;
    const nY = Math.floor(i / 3) + y - 1;

    if (
      (x === nX && y === nY) ||
      nX < 0 ||
      nY < 0 ||
      nX >= gridSize ||
      nY >= gridSize
    ) {
      return acc;
    }

    return [...acc, [nX, nY]];
  }, []);
