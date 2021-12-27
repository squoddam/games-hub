import { nanoid } from 'nanoid';
import React, { memo, useMemo } from 'react';

import { WaypointBase } from '@balls/types';
import { BALL_SIZE, COLLISION } from '@balls/constants';

import Rect from '../Rect';
import RectBody from '../matterBodies/RectBody';
import Composite from '../Composite';

const BIN_SIZE = BALL_SIZE * 2.2;
const BIN_WALL_SIZE = 10;

type BinProps = {
  x: number;
  y: number;
  rotation?: number;
};

const Bin = ({ x, y, rotation = 0 }: BinProps) => {
  const options = useMemo(
    () => ({
      isStatic: true,
      collisionFilter: {
        category: COLLISION.CATEGORY.BIN,
        mask: COLLISION.CATEGORY.BALL,
      },
    }),
    []
  );

  const rects = useMemo(
    () => [
      {
        id: nanoid(),
        x: -BIN_SIZE / 2 - BIN_WALL_SIZE,
        y: 0,
        width: BIN_WALL_SIZE,
        height: BIN_SIZE * 1.5,
      },
      {
        id: nanoid(),
        x: -BIN_SIZE / 2,
        y: 0,
        width: BIN_SIZE + BIN_WALL_SIZE,
        height: BIN_WALL_SIZE,
      },
      {
        id: nanoid(),
        x: BIN_SIZE / 2,
        y: 0,
        width: BIN_WALL_SIZE,
        height: BIN_SIZE * 1.5,
      },
    ],
    []
  );

  const sensorOptions = useMemo(
    () => ({
      isStatic: true,
      isSensor: true,
      collisionFilter: {
        category: COLLISION.CATEGORY.BIN,
        mask: COLLISION.CATEGORY.BALL,
      },
    }),
    []
  );

  return (
    <Composite x={x} y={y} rotation={rotation}>
      {rects.map(({ id, ...rectProps }) => (
        <Rect key={id} {...rectProps} options={options} />
      ))}
      <RectBody
        x={-BIN_SIZE / 2}
        y={0}
        width={BIN_SIZE}
        height={BIN_SIZE}
        options={sensorOptions}
        onCollision={console.log}
      />
    </Composite>
  );
};

const Finish = ({ x, y, rotation }: WaypointBase) => {
  return <Bin x={x} y={y} rotation={rotation} />;
};

export default memo(Finish);
