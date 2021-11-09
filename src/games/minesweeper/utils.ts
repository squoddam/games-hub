import { Vector2 } from '@/types';
import { randMinMax, times } from '@/utils';
import { BoardCell } from './types';

export const indexToGrid = (index: number, gridSize: number): Vector2 =>
  [index % gridSize, Math.floor(index / gridSize)] as Vector2;

export const gridToIndex = ([c, r]: Vector2, gridSize: number): number =>
  r * gridSize + c;

export const getKey = (point: Vector2): string => point.join('-');

export const keyToVector = (pointKey: string): Vector2 =>
  pointKey.split('-').map(Number) as Vector2;

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

const randGridCells = (
  amount: number,
  gridSize: number
): Record<string, boolean> => {
  if (amount >= gridSize ** 2) {
    throw Error('randGridCells: amount should be less than gridSize');
  }

  const indexesMap: Record<string, boolean> = {};

  let assigned = 0;

  while (assigned < amount) {
    const currIndex = randMinMax(0, gridSize ** 2);

    if (indexesMap[currIndex]) {
      continue;
    }

    indexesMap[currIndex] = true;
    assigned++;
  }

  return Object.fromEntries(
    Object.keys(indexesMap).map((index) => [
      indexToGrid(Number(index), gridSize).join('-'),
      true,
    ])
  );
};

export const createBoardArr = (
  gridSize: number,
  minesAmount: number
): BoardCell[] => {
  const minesMap = randGridCells(minesAmount, gridSize);

  return times(gridSize ** 2).map((index) => {
    const coords = indexToGrid(index, gridSize);

    const isMine = minesMap[getKey(coords)];

    if (isMine) {
      return {
        coords,
        isRevealed: false,
        isMine: true,
      };
    }

    const neighbors = getNeighbors(coords, gridSize);

    const nearbyMinesCount = neighbors.filter(
      (nCoords) => minesMap[getKey(nCoords)]
    ).length;

    return {
      coords,
      isRevealed: false,
      isMine: false,
      nearbyMinesCount,
    };
  });
};

export function* clearSpaceGen(
  gridSize: number,
  board: BoardCell[],
  startCoords: Vector2
): Generator<Vector2[]> {
  const visitedCells = { [getKey(startCoords)]: true };

  let currLayer = [startCoords];

  let isSpaceLeft = true;

  while (isSpaceLeft) {
    isSpaceLeft = false;

    yield currLayer;

    currLayer = currLayer.flatMap((coords) => {
      const currIndex = gridToIndex(coords, gridSize);

      if (board[currIndex].nearbyMinesCount) {
        return [];
      }

      const n = getNeighbors(coords, gridSize)
        .map((nCoords) => ({
          cellKey: getKey(nCoords),
          index: gridToIndex(nCoords, gridSize),
        }))
        .filter(
          ({ cellKey, index }) =>
            board[index] &&
            !board[index].isMine &&
            !board[index].isRevealed &&
            !visitedCells[cellKey]
        )
        .map(({ cellKey }) => {
          visitedCells[cellKey] = true;

          return keyToVector(cellKey);
        });

      return n;
    });

    if (currLayer.length > 0) {
      isSpaceLeft = true;
    }
  }

  return [];
}
