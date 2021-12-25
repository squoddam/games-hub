import { useMemo } from 'react';

import { randMinMax } from '@/utils';

import { COLLISION } from '../constants';
import { CircleBodyProps } from './matterBodies/CircleBody';
import Circle from './Circle';

type BallProps = { force?: Matter.Vector } & Omit<
  CircleBodyProps,
  'options' | 'fill'
>;

const FILLS = [0xfbb037, 0x6622cc, 0x84d473, 0xfb62f6, 0x333333];

const generateFill = () => FILLS[randMinMax(0, FILLS.length)];

const Ball = ({ id, x, y, radius, force, onCollision }: BallProps) => {
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
      ...(force && { force }),
    }),
    []
  );

  const fill = useMemo(generateFill, []);

  return (
    <Circle
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
