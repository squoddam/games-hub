import { nanoid } from 'nanoid';
import React, { memo, useEffect, useMemo, useRef } from 'react';
import Matter from 'matter-js';

import { WaypointBase } from '@balls/types';
import { BALL_SIZE, COLLISION } from '@balls/constants';

import Rect from '../Rect';
import RectBody from '../matterBodies/RectBody';

const BIN_SIZE = BALL_SIZE * 2.2;
const BIN_WALL_SIZE = 10;

type CompositeProps = {
  children: React.ReactNode | React.ReactNode[] | null;
  x: number;
  y: number;
  rotation: number;
};

const Composite = ({
  children,
  x,
  y,
  rotation = 0,
}: CompositeProps): React.ReactNode => {
  const compositeRef = useRef<Matter.Composite>();
  const childrenRef = useRef<Record<string, Matter.Body>>({});

  useEffect(() => {
    if (compositeRef.current === undefined) {
      compositeRef.current = Matter.Composite.create();
    }

    const bodies: Matter.Body[] = Object.values(childrenRef.current);

    if (bodies.length > 0) {
      Matter.Composite.add(compositeRef.current, bodies);
    }

    return () => {
      if (compositeRef.current) {
        /* TODO: Argument of type 'Body[]' is not assignable to parameter of type 'Composite | Body | Constraint'.
          Maybe PR to matter-js types?
        */
        // @ts-ignore
        Matter.Composite.remove(compositeRef.current, bodies);
      }
    };
  }, [children]);

  useEffect(() => {
    if (compositeRef.current) {
      Matter.Composite.translate(compositeRef.current, { x, y });
    }
  }, [x, y]);

  useEffect(() => {
    if (compositeRef.current) {
      Matter.Composite.rotate(compositeRef.current, rotation, { x, y }, true);
    }
  }, [x, y, rotation]);

  return React.Children.map<React.ReactNode, React.ReactNode>(
    children,
    (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          ref: (ref) => {
            if (ref !== null) {
              const body = ref.body || ref;
              if (body) {
                childrenRef.current[body.id] = body;
              }
            }
          },
        });
      }

      return null;
    }
  );
};

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
  const sensorId = useMemo(nanoid, []);

  return (
    <Composite x={x} y={y} rotation={rotation}>
      {rects.map((rect) => (
        <Rect key={rect.id} {...rect} options={options} />
      ))}
      <RectBody
        id={sensorId}
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
