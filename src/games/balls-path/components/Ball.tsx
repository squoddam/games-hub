import { memo, useMemo } from 'react';

import { randMinMax } from '@/utils';

import { COLLISION, COLORS } from '../constants';
import { CircleBodyProps } from './matterBodies/CircleBody';
import Circle from './Circle';

type BallProps = { force?: Matter.Vector } & Omit<
  CircleBodyProps,
  'options' | 'fill'
>;

const generateFill = () => COLORS[randMinMax(0, COLORS.length)];

const Ball = ({ id, x, y, radius, force, onCollision }: BallProps) => {
  const options = useMemo(
    () => ({
      id,
      collisionFilter: {
        category: COLLISION.CATEGORY.BALL,
        mask:
          COLLISION.CATEGORY.WALL |
          COLLISION.CATEGORY.OBSTACLE |
          COLLISION.CATEGORY.BALL,
      },
      restitution: 1,
      ...(force && { force }),
    }),
    [id, force]
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

export default memo(Ball);
