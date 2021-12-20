import { useCallback, useRef } from 'react';
import { Bodies } from 'matter-js';

import { UseMatterProps } from '@balls/types';
import { useMatter } from '@balls/MatterCtx';

import { default as CircleGraphics } from '@/components/primitives/Circle';
import { ShapeRefType } from '@/components/primitives/Shape';

export type CircleProps = {
  id: string;
  x: number;
  y: number;
  radius: number;
  startAngle?: number;
  endAngle?: number;
  anticlockwise?: boolean;
  fill?: number;
  options?: Matter.IChamferableBodyDefinition | undefined;
  onCollision?: UseMatterProps['onCollision'];
};

const Circle = ({
  id,
  x,
  y,
  radius,
  startAngle,
  endAngle,
  anticlockwise = false,
  fill = 0x000000,
  onCollision,
  options,
}: CircleProps) => {
  const getBody = useCallback(
    () => Bodies.circle(x, y, radius, options),
    [x, y, radius, options]
  );

  const geometryRef = useRef<ShapeRefType>(null);

  const onUpdate = useCallback(
    (body) => {
      if (geometryRef.current) {
        geometryRef.current.draw({
          x: body.position.x,
          y: body.position.y,
          radius,
          fill,
          startAngle,
          endAngle,
          anticlockwise,
        });
      }
    },
    [radius, fill, startAngle, endAngle, anticlockwise]
  );

  useMatter({
    id,
    getBody,
    onUpdate,
    onCollision,
  });

  return (
    <CircleGraphics
      ref={geometryRef}
      x={x}
      y={y}
      radius={radius}
      startAngle={startAngle}
      endAngle={endAngle}
      anticlockwise={anticlockwise}
      fill={fill}
    />
  );
};

Circle.displayName = 'Circle';

export default Circle;
