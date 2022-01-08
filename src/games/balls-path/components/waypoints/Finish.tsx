import { nanoid } from 'nanoid';
import React, { memo, useContext, useMemo } from 'react';
import Matter from 'matter-js';
import { Container, Text } from '@inlet/react-pixi';

import { useDebounce } from '@/hooks';
import CircleGraphics from '@/components/primitives/CircleGraphics';

import { ACTIONS, storeCtx } from '@balls/storeCtx';
import { WaypointBase } from '@balls/types';
import { BALL_SIZE, COLLISION } from '@balls/constants';

import Rect from '../Rect';
import RectBody from '../matterBodies/RectBody';
import Composite from '../Composite';

const BIN_SIZE = BALL_SIZE * 2.2;
const BIN_WALL_SIZE = 10;

const Counter = ({
  x,
  y,
  collectedAmount,
  totalAmount,
}: {
  x: number;
  y: number;
  collectedAmount: number;
  totalAmount: number;
}) => (
  <Container x={x} y={y}>
    <CircleGraphics
      x={0}
      y={0}
      fillAlpha={0}
      stroke={0x000000}
      strokeWidth={2}
      radius={BALL_SIZE}
    />
    <Text x={0} y={0} anchor={0.5} text={`${collectedAmount}/${totalAmount}`} />
  </Container>
);

type BinProps = {
  x: number;
  y: number;
  rotation?: number;
};

const Bin = ({ x, y, rotation = 0 }: BinProps) => {
  const { dispatch, store } = useContext(storeCtx);

  const { collectedAmount } = store;

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
        dispatch({
          type: ACTIONS.SET_COLLECTED_AMOUNT,
          payload: { collectedAmount: collectedAmount + 1 },
        });
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
      <Counter
        x={
          Math.cos(rotation + Math.PI / 2) * (BALL_SIZE + BIN_WALL_SIZE * 2) + x
        }
        y={
          Math.sin(rotation + Math.PI / 2) * (BALL_SIZE + BIN_WALL_SIZE * 2) + y
        }
        collectedAmount={collectedAmount}
        totalAmount={5}
      />
    </Composite>
  );
};

const Finish = ({ x, y, rotation }: WaypointBase) => {
  return <Bin x={x} y={y} rotation={rotation} />;
};

export default memo(Finish);
