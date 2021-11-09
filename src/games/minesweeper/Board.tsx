import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Container, Stage } from '@inlet/react-pixi';
import produce from 'immer';
import { Howl } from 'howler';
import { settings, SCALE_MODES } from 'pixi.js';

import { useWindowResize } from '@/hooks';
import { Vector2 } from '@/types';
import PixiViewport from '@/components/PixiViewport';
import Rect from '@/components/primitives/Rect';

import { clearSpaceGen, createBoardArr, gridToIndex } from './utils';
import { BoardCell } from './types';
import { CellProps } from './components/Cell';
import CellGroup from './components/CellGroup';

settings.SCALE_MODE = SCALE_MODES.NEAREST;

const clickSound = new Howl({
  src: '/click.ogg',
});

const loseSound = new Howl({
  src: '/lose.mp3',
});

const winSound = new Howl({
  src: '/win.wav',
});

const STAGE_OPTIONS = {
  antialias: true,
  autoDensity: true,
  backgroundColor: 0xffffff,
};

const CELL_SIZE = 120;
const GRID_SIZE = 10;
const BORDER_PADDING = 30;
const BORDER_WIDTH = 3;
const CELL_BORDER_PADDING = 15;

const VIEW_BOX_SIDE = CELL_SIZE * GRID_SIZE + BORDER_PADDING * 2;

const MINES_AMOUNT = 10;

let openCellsCount = 0;

const Board = () => {
  const [sideSize, setSideSize] = useState(0);

  useEffect(() => {
    setSideSize(Math.min(window.innerWidth, window.innerHeight) - 16);
  }, []);

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
    let isGameOverRef = false;

    setBoard(
      produce((draft) => {
        const index = gridToIndex([c, r], GRID_SIZE);

        const cell = draft[index];

        if (cell.isMine) {
          setIsGameOver(true);

          isGameOverRef = true;

          loseSound.play();
        }
      })
    );

    if (isGameOverRef) {
      return;
    }

    const clearSpace = clearSpaceGen(GRID_SIZE, boardStateRef.current, [c, r]);

    const updateBoard = () => {
      const layerToClear = clearSpace.next().value as Vector2[];

      if (layerToClear.length > 0) {
        openCellsCount += layerToClear.length;

        clickSound.play();

        setBoard(
          produce((draft) => {
            layerToClear.forEach((coords) => {
              const index = gridToIndex(coords, GRID_SIZE);

              draft[index].isRevealed = true;
            });
          })
        );

        setTimeout(updateBoard, 80);
      } else if (GRID_SIZE ** 2 - openCellsCount === MINES_AMOUNT) {
        winSound.play();
      }
    };

    updateBoard();
  }, []);

  return (
    <div className="board-container">
      <Stage width={sideSize} height={sideSize} options={STAGE_OPTIONS}>
        <PixiViewport
          screenWidth={sideSize}
          screenHeight={sideSize}
          worldWidth={VIEW_BOX_SIDE}
          worldHeight={VIEW_BOX_SIDE}
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
              cellSize={CELL_SIZE}
              cellBorderPadding={CELL_BORDER_PADDING}
            />
          </Container>
        </PixiViewport>
      </Stage>
    </div>
  );
};

export default Board;
