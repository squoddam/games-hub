import { memo, useMemo, useRef } from 'react';
import { Container, Text } from '@inlet/react-pixi';
import { TextStyle, Text as PixiText } from '@pixi/text';

import { Vector2 } from '@/types';
import { useTweenable } from '@/hooks';
import RectGraphics from '@/components/primitives/RectGraphics';
import CircleGraphics from '@/components/primitives/CircleGraphics';
import { ShapeRefType } from '@/components/primitives/Shape';

const MINE_PADDING = 5;
const MINES_COUNTS_COLORS = [
  0x01579b, 0x019b62, 0xa2c80b, 0xf2b918, 0xf26818, 0xa73e01, 0xa70101,
  0x810639,
];

const getTextStyle = (fontSize: number, color: number = 0x000000) =>
  new TextStyle({
    fontSize,
    strokeThickness: 2,
    fill: color,
    stroke: color,
  });

export type CellProps = {
  coords: Vector2;
  cellSize: number;
  cellBorderPadding: number;
  isRevealed: boolean;
  isMine: boolean;
  nearbyMinesCount?: number;

  onClick: ({ r, c }: { r: number; c: number }) => void;
};

const Cell = ({
  coords,
  cellSize,
  cellBorderPadding,
  isRevealed,
  isMine,
  nearbyMinesCount,
  onClick,
}: CellProps) => {
  const [c, r] = coords;
  const left = c * cellSize;
  const top = r * cellSize;

  const to = {
    x: isRevealed ? left + cellSize / 2 : left + cellBorderPadding,
    y: isRevealed ? top + cellSize / 2 : top + cellBorderPadding,
    width: isRevealed ? 0 : cellSize - cellBorderPadding * 2,
    height: isRevealed ? 0 : cellSize - cellBorderPadding * 2,
  };

  const rectRef = useRef<ShapeRefType>();

  useTweenable(
    {
      render: (state: typeof to) => {
        if (rectRef.current) {
          rectRef.current.draw(state);
        }
      },
      to,
      duration: 200,
    },
    [isRevealed]
  );

  const textRef = useRef<PixiText>(null);

  useTweenable(
    {
      render: ({ fSize }) => {
        if (textRef.current) {
          textRef.current.style.fontSize = fSize;
        }
      },
      to: { fSize: isRevealed ? 36 : 1 },
      duration: 300,
      easing: 'linear',
    },
    [isRevealed]
  );

  const handleClick = () => {
    onClick({ c, r });
  };

  return (
    <Container>
      {isRevealed && isMine && (
        <CircleGraphics
          x={left + cellSize / 2}
          y={top + cellSize / 2}
          radius={cellSize / 2 - (cellBorderPadding + MINE_PADDING) * 2}
          fill={0xff0000}
        />
      )}
      {isRevealed && !!nearbyMinesCount && (
        <Text
          ref={textRef}
          x={left + cellSize / 2}
          y={top + cellSize / 2}
          anchor={0.5}
          text={String(nearbyMinesCount)}
          style={getTextStyle(24, MINES_COUNTS_COLORS[nearbyMinesCount - 1])}
        />
      )}
      <RectGraphics
        ref={rectRef}
        x={left}
        y={top}
        width={cellSize}
        height={cellSize}
        radius={20}
        onClick={handleClick}
        animConfig={{ duration: 300 }}
      />
    </Container>
  );
};

export default memo(Cell);
