import { useCallback, useMemo } from 'react';
import { Bodies } from 'matter-js';
import * as PIXI from 'pixi.js';
import { nanoid } from 'nanoid';
import { useMatter } from '../MatterCtx';

type MatterCircleProps = {
  id?: string;
  x: number;
  y: number;
  radius: number;
  fill?: number;
  options?: Matter.IChamferableBodyDefinition | undefined;
};

const MatterCircle = ({
  id,
  x,
  y,
  radius,
  fill = 0x000000,
  options,
}: MatterCircleProps) => {
  const idMemoise = useMemo(() => id || nanoid(), [id]);
  const getBody = useCallback(
    () => Bodies.circle(x, y, radius, options),
    [x, y, radius, options]
  );

  const getGeometry = useCallback(() => {
    const g = new PIXI.Graphics();

    return g
      .clear()
      .lineStyle(0)
      .beginFill(fill)
      .drawCircle(x, y, radius)
      .endFill();
  }, [x, y, radius, fill]);

  const update = useCallback(
    (body, geometry: PIXI.Graphics) => {
      geometry
        .clear()
        .lineStyle(0)
        .beginFill(fill)
        .drawCircle(body.position.x, body.position.y, radius)
        .endFill();
    },
    [radius, fill]
  );

  useMatter({
    id: idMemoise,
    getBody,
    getGeometry,
    update,
  });

  return null;
};

type BallProps = {
  x: number;
  y: number;
  radius: number;
};

const Ball = ({ x, y, radius }: BallProps) => {
  const options = useMemo(() => ({ restitution: 0.8 }), []);

  return (
    <MatterCircle
      x={x}
      y={y}
      radius={radius}
      fill={0xff0000}
      options={options}
    />
  );
};

export default Ball;
