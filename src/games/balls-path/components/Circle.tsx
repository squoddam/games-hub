import { forwardRef, memo, useImperativeHandle, useRef } from 'react';
import { Body } from 'matter-js';
import { useTick } from '@inlet/react-pixi';

import CircleGraphics, {
  CircleGraphicsProps,
} from '@/components/primitives/CircleGraphics';
import { ShapeRefType } from '@/components/primitives/Shape';

import CircleBody, { CircleBodyProps } from './matterBodies/CircleBody';

type CircleType = CircleBodyProps & CircleGraphicsProps;

const Circle = forwardRef(
  ({ x, y, radius, options, onCollision, fill }: CircleType, ref) => {
    const bodyRef = useRef<Body | null>(null);
    const graphicsRef = useRef<ShapeRefType>(null);

    useImperativeHandle(
      ref,
      () => ({
        body: bodyRef.current,
        graphics: graphicsRef.current,
      }),
      []
    );

    useTick(() => {
      if (bodyRef.current && graphicsRef.current) {
        graphicsRef.current.draw({
          x: bodyRef.current.position.x,
          y: bodyRef.current.position.y,
        });
      }
    });

    return (
      <>
        <CircleBody
          ref={bodyRef}
          x={x}
          y={y}
          radius={radius}
          options={options}
          onCollision={onCollision}
        />
        <CircleGraphics
          ref={graphicsRef}
          x={x}
          y={y}
          radius={radius}
          fill={fill}
        />
      </>
    );
  }
);

Circle.displayName = 'Circle';

export default memo(Circle);
