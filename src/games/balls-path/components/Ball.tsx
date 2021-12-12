import { useCallback, useMemo, useRef } from 'react';
import Matter, { Bodies } from 'matter-js';
import * as PIXI from 'pixi.js';
import { useMatter } from '../MatterCtx';
import { Graphics } from '@inlet/react-pixi';
import { randMinMax } from '@/utils';
import { COLLISION } from '../constants';
import { UseMatterProps } from '../types';

type MatterCircleProps = {
  id: string;
  x: number;
  y: number;
  radius: number;
  fill?: number;
  options?: Matter.IChamferableBodyDefinition | undefined;
  onCollision?: UseMatterProps['onCollision'];
};

const MatterCircle = ({
  id,
  x,
  y,
  radius,
  fill = 0x000000,
  onCollision,
  options,
}: MatterCircleProps) => {
  const getBody = useCallback(
    () => Bodies.circle(x, y, radius, options),
    [x, y, radius, options]
  );

  const geometryRef = useRef<PIXI.Graphics>(new PIXI.Graphics());

  const onUpdate = useCallback(
    (body) => {
      geometryRef.current
        ?.clear()
        .lineStyle(0)
        .beginFill(fill)
        .drawCircle(body.position.x, body.position.y, radius)
        .endFill();
    },
    [radius, fill]
  );

  useMatter({
    id,
    getBody,
    onUpdate,
    onCollision,
  });

  return <Graphics ref={geometryRef} />;
};

type BallProps = Omit<MatterCircleProps, 'options' | 'fill'>

const FILLS = [0xfbb037, 0x6622cc, 0x84d473, 0xfb62f6, 0x333333];

const generateFill = () => FILLS[randMinMax(0, FILLS.length)];

const Ball = ({ id, x, y, radius, onCollision }: BallProps) => {
  const options = useMemo(
    () => ({
      collisionFilter: {
        category: COLLISION.CATEGORY.BALL,
        mask:
          COLLISION.CATEGORY.WALL |
          COLLISION.CATEGORY.OBSTACLE |
          COLLISION.CATEGORY.BALL,
      },
      restitution: 1.1,
    }),
    []
  );

  const fill = useMemo(generateFill, []);

  return (
    <MatterCircle
      id={id}
      x={x}
      y={y}
      radius={radius}
      fill={fill}
      options={options}
      onCollision={onCollision}
    />
  );
};

export default Ball;
