import * as PIXI from 'pixi.js';
import { Bodies } from 'matter-js';
import { useCallback, useMemo, useRef } from 'react';
import { useMatter } from '../MatterCtx';
import { COLLISION, WORLD_SIZE } from '../constants';
import { toFixed } from '@/utils';
import { Graphics } from '@inlet/react-pixi';

type MatterRectProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: number;
  options: Matter.IChamferableBodyDefinition | undefined;
};

export const MatterRect = ({
  id,
  x,
  y,
  width,
  height,
  fill = 0x000000,
  options,
}: MatterRectProps) => {
  const getBody = useCallback(
    () =>
      Bodies.rectangle(x + width / 2, y + height / 2, width, height, options),
    [x, y, width, height, options]
  );

  const geometryRef = useRef<PIXI.Graphics>(new PIXI.Graphics());

  const onUpdate = useCallback(
    (body) => {
      geometryRef.current
        ?.clear()
        .lineStyle(0)
        .beginFill(fill)
        .drawRect(
          toFixed(body.position.x, 2) -
            (toFixed(body.bounds.max.x, 2) - toFixed(body.bounds.min.x, 2)) / 2,
          toFixed(body.position.y, 2) -
            (toFixed(body.bounds.max.y, 2) - toFixed(body.bounds.min.y, 2)) / 2,
          width,
          height
        )
        .endFill();
    },
    [width, height, fill]
  );

  useMatter({
    id,
    getBody,
    onUpdate,
  });

  return <Graphics ref={geometryRef} />;
};

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
        <MatterRect
          key={id}
          id={id}
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
