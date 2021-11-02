import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { useWindowResize } from './hooks';
import {
  getKey,
  getNeighbors,
  gridToIndex,
  indexToGrid,
  keyToVector,
  times,
} from './utils';
import { Vector2 } from './types';
import './styles.css';

import Cell, { CellProps } from './Cell';
import produce from 'immer';
import { Container, Stage } from '@inlet/react-pixi';
import PixiViewport from './PixiViewport';
import Rect from './Primitives/Rect';

const STAGE_OPTIONS = {
  antialias: true,
  autoDensity: true,
  // backgroundAlpha: 1,
  backgroundColor: 0xffffff,
};

const CELL_SIZE = 120;
const GRID_SIZE = 10;
const BORDER_PADDING = 30;
const BORDER_WIDTH = 3;
const CELL_BORDER_PADDING = 15;

const VIEW_BOX_SIDE = CELL_SIZE * GRID_SIZE + BORDER_PADDING * 2;

const MINES_AMOUNT = 10;

type BoardCell = {
  coords: Vector2;
  isMine: boolean;
  nearbyMinesCount?: number;
  isRevealed: boolean;
};

const randMinMax = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min) + min);

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

const createBoardArr = (gridSize: number, minesAmount: number): BoardCell[] => {
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

function* clearSpaceGen(
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
            board[index] && !board[index].isMine && !visitedCells[cellKey]
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

const CellGroup = memo<{
  board: BoardCell[];
  onCellClick: CellProps['onClick'];
  isGameOver: boolean;
}>(({ board, onCellClick, isGameOver }) => (
  <>
    {board.map(({ coords, isMine, nearbyMinesCount, isRevealed }) => (
      <Cell
        key={coords.join('-')}
        coords={coords}
        cellSize={CELL_SIZE}
        cellBorderPadding={CELL_BORDER_PADDING}
        onClick={onCellClick}
        isRevealed={isGameOver || isRevealed}
        isMine={isMine}
        nearbyMinesCount={nearbyMinesCount}
      />
    ))}
  </>
));

export default function App() {
  const [sideSize, setSideSize] = useState(
    Math.min(window.innerWidth, window.innerHeight) - 16
  );
  const [board, setBoard] = useState<BoardCell[]>(
    createBoardArr(GRID_SIZE, MINES_AMOUNT)
  );
  const [isGameOver, setIsGameOver] = useState(false);

  useWindowResize(() => {
    setSideSize(Math.min(window.innerWidth, window.innerHeight) - 16);
  });

  const boardStateRef = useRef(board);

  useEffect(() => {
    boardStateRef.current = board;
  }, [board]);

  const handleCellClick = useCallback<CellProps['onClick']>(({ c, r }) => {
    setBoard(
      produce((draft) => {
        const index = gridToIndex([c, r], GRID_SIZE);

        const cell = draft[index];

        if (cell.isMine) {
          setIsGameOver(true);
        }

        cell.isRevealed = true;
      })
    );

    const clearSpace = clearSpaceGen(GRID_SIZE, boardStateRef.current, [c, r]);

    const updateBoard = () => {
      const layerToClear = clearSpace.next().value as Vector2[];

      if (layerToClear.length > 0) {
        setBoard(
          produce((draft) => {
            layerToClear.forEach((coords) => {
              const index = gridToIndex(coords, GRID_SIZE);

              draft[index].isRevealed = true;
            });
          })
        );

        setTimeout(updateBoard, 30);
      }
    };

    updateBoard();
  }, []);

  return (
    <div className="App">
      <div className="board-container">
        <Stage width={sideSize} height={sideSize} options={STAGE_OPTIONS}>
          <PixiViewport
            screenWidth={sideSize}
            screenHeight={sideSize}
            worldWidth={VIEW_BOX_SIDE}
            worldHeight={VIEW_BOX_SIDE}
            // plugins={['drag', 'pinch', 'wheel', 'decelerate']}
          >
            <Container position={[BORDER_PADDING, BORDER_PADDING]}>
              <Rect
                x={0}
                y={0}
                width={VIEW_BOX_SIDE - BORDER_PADDING * 2}
                height={VIEW_BOX_SIDE - BORDER_PADDING * 2}
                radius={20}
                fill={0xffffff}
                stroke={0x000000}
                strokeWidth={BORDER_WIDTH}
              />
              <CellGroup
                board={board}
                onCellClick={handleCellClick}
                isGameOver={isGameOver}
              />
              {/* <Rect x={15} y={15} width={10} height={10} fill={0xff0000} /> */}
            </Container>
          </PixiViewport>
        </Stage>
      </div>
    </div>
  );
}
