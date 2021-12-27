import { useMemo } from 'react';
import { COLLISION } from '../constants';
import Rect from './Rect';

const WALL_THICKNESS = 10;

type WallsProps = {
  wallSize: number;
  wallThickness?: number;
};

const Walls = ({ wallSize, wallThickness = WALL_THICKNESS }: WallsProps) => {
  const walls = useMemo(
    () => [
      // TOP
      {
        id: 'top',
        x: 0,
        y: 0,
        width: wallSize,
        height: wallThickness,
      },

      // BOTTOM
      {
        id: 'bottom',
        x: 0,
        y: wallSize - wallThickness,
        width: wallSize,
        height: wallThickness,
      },

      // LEFT
      {
        id: 'left',
        x: 0,
        y: 0,
        width: wallThickness,
        height: wallSize,
      },

      // RIGHT
      {
        id: 'right',
        x: wallSize - wallThickness,
        y: 0,
        width: wallThickness,
        height: wallSize,
      },
    ],
    [wallSize, wallThickness]
  );

  const options = useMemo(
    () => ({
      collisionFilter: {
        category: COLLISION.CATEGORY.WALL,
        mask: COLLISION.CATEGORY.BALL,
      },
      isStatic: true,
    }),
    []
  );

  return (
    <>
      {walls.map(({ id, x, y, width, height }) => (
        <Rect
          key={id}
          x={x}
          y={y}
          width={width}
          height={height}
          options={options}
        />
      ))}
    </>
  );
};

export default Walls;
