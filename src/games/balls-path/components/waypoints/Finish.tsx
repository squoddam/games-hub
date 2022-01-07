import { nanoid } from 'nanoid';
import React, { memo, useContext, useMemo } from 'react';
import Matter from 'matter-js';

import { useDebounce } from '@/hooks';

import { ACTIONS, storeCtx } from '@balls/storeCtx';
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
  const { dispatch } = useContext(storeCtx);
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

  const handleSensorCollision = useDebounce(
    ({ bodyB: otherBody }: Matter.IPair) => {
      if (otherBody.collisionFilter.category === COLLISION.CATEGORY.BALL) {
        dispatch({ type: ACTIONS.REMOVE_BALL, payload: { id: otherBody.id } });
      }
    },
    100
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
        onCollision={handleSensorCollision}
      />
    </Composite>
  );
};

const Finish = ({ x, y, rotation }: WaypointBase) => {
  return <Bin x={x} y={y} rotation={rotation} />;
};

export default memo(Finish);
