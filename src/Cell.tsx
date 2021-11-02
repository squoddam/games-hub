import { memo, useMemo, useRef } from 'react';
import { Vector2 } from './types';

import Rect from './Primitives/Rect';
import { getKey } from './utils';
import { Container, Text } from '@inlet/react-pixi';
import { TextStyle, Text as PixiText } from '@pixi/text';
import { useAnime } from './hooks';
import Circle from './Primitives/Circle';

const minesCountsColors = [
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
  const padding = useMemo(
    () => cellBorderPadding + (isRevealed ? 5 : 0),
    [cellBorderPadding, isRevealed]
  );
  const [c, r] = coords;
  const left = c * cellSize;
  const top = r * cellSize;

  const to = {
    x: !isRevealed ? left + padding : left + cellSize / 2,
    y: !isRevealed ? top + padding : top + cellSize / 2,
    width: !isRevealed ? cellSize - padding * 2 : 0,
    height: !isRevealed ? cellSize - padding * 2 : 0,
  };

  const textRef = useRef<PixiText>(null);

  const fSizeMemo = useMemo(
    () => ({ fSize: isRevealed ? 36 : 1 }),
    [isRevealed]
  );

  useAnime({
    toProps: fSizeMemo,
    onUpdate: ({ fSize }) => {
      if (textRef.current) {
        textRef.current.style.fontSize = fSize;
      }
    },
    config: { duration: 300 },
  });

  return (
    <Container>
      {isRevealed && isMine && (
        <Circle
          x={left + cellSize / 2}
          y={top + cellSize / 2}
          radius={cellSize / 2 - padding * 2}
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
          style={getTextStyle(24, minesCountsColors[nearbyMinesCount - 1])}
        />
      )}
      <Rect
        coordsKey={getKey(coords)}
        {...to}
        radius={20}
        onClick={() => onClick({ c, r })}
        animConfig={{ duration: 300 }}
      />
    </Container>
  );
};

export default memo(Cell);
