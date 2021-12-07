import * as PIXI from 'pixi.js';
import { Bodies } from 'matter-js';
import { useCallback, useMemo } from 'react';
import { useMatter } from '../MatterCtx';
import { WORLD_SIZE } from '../constants';
import { toFixed } from '@/utils';
import { nanoid } from 'nanoid';

type RectMatterProps = {
  id?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: number;
  options: Matter.IChamferableBodyDefinition | undefined;
};

const RectMatter = ({
  id,
  x,
  y,
  width,
  height,
  fill = 0x000000,
  options,
}: RectMatterProps) => {
  const idMemoise = useMemo(() => id || nanoid(), [id]);
  const getBody = useCallback(
    () =>
      Bodies.rectangle(x + width / 2, y + height / 2, width, height, options),
    [x, y, width, height, options]
  );

  const getGeometry = useCallback(() => {
    const g = new PIXI.Graphics();

    window.g = g;

    return g
      .clear()
      .lineStyle(0)
      .beginFill(fill)
      .drawRect(x, y, width, height)
      .endFill();
  }, [x, y, width, height, fill]);

  const update = useCallback(
    (body, geometry: PIXI.Graphics) => {
      geometry
        .clear()
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
    id: idMemoise,
    getBody,
    getGeometry,
    update,
  });

  return null;
};

const WALL_THICKNESS = 10;

const Walls = () => {
  const walls = [
    // TOP
    {
      id: 'top',
      x: 0,
      y: 0,
      width: WORLD_SIZE,
      height: WALL_THICKNESS,
    },

    // BOTTOM
    {
      id: 'bottom',
      x: 0,
      y: WORLD_SIZE - WALL_THICKNESS,
      width: WORLD_SIZE,
      height: WALL_THICKNESS,
    },

    // LEFT
    {
      id: 'left',
      x: 0,
      y: 0,
      width: WALL_THICKNESS,
      height: WORLD_SIZE,
    },

    // RIGHT
    {
      id: 'right',
      x: WORLD_SIZE - WALL_THICKNESS,
      y: 0,
      width: WALL_THICKNESS,
      height: WORLD_SIZE,
    },
  ];

  const options = useMemo(() => ({ isStatic: true }), []);

  return (
    <>
      {walls.map(({ id, x, y, width, height, fill }) => (
        <RectMatter
          key={id}
          x={x}
          y={y}
          width={width}
          height={height}
          fill={fill}
          options={options}
        />
      ))}
    </>
  );
};

export default Walls;
