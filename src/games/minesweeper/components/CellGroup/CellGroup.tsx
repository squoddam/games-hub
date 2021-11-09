import { memo } from 'react';
import { BoardCell } from '@minesweeper/types';
import Cell, { CellProps } from '@minesweeper/components/Cell';

const CellGroup = memo<{
  board: BoardCell[];
  onCellClick: CellProps['onClick'];
  isGameOver: boolean;
  cellSize: number;
  cellBorderPadding: number;
}>(({ board, onCellClick, isGameOver, cellSize, cellBorderPadding }) => (
  <>
    {board.map(({ coords, isMine, nearbyMinesCount, isRevealed }) => (
      <Cell
        key={coords.join('-')}
        coords={coords}
        cellSize={cellSize}
        cellBorderPadding={cellBorderPadding}
        onClick={onCellClick}
        isRevealed={isGameOver || isRevealed}
        isMine={isMine}
        nearbyMinesCount={nearbyMinesCount}
      />
    ))}
  </>
));

CellGroup.displayName = 'CellGroup';

export default CellGroup;
