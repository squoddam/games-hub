import { useCallback, useRef } from 'react';
import { Bodies } from 'matter-js';

import { toFixed } from '@/utils';
import { useMatter } from '@balls/MatterCtx';
import { default as RectGraphics } from '@/components/primitives/Rect';
import { ShapeRefType } from '@/components/primitives/Shape';

export type RectProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill?: number;
  options?: Matter.IChamferableBodyDefinition | undefined;
};

const Rect = ({
  id,
  x,
  y,
  width,
  height,
  fill = 0x000000,
  options,
}: RectProps) => {
  const getBody = useCallback(() => {
    const body = Bodies.rectangle(
      x + width / 2,
      y + height / 2,
      width,
      height,
      options
    );

    return body;
  }, [x, y, width, height, options]);

  const geometryRef = useRef<ShapeRefType>(null);

  const onUpdate = useCallback(
    (body) => {
      if (geometryRef.current) {
        geometryRef.current.draw({
          x:
            toFixed(body.position.x, 2) -
            (toFixed(body.bounds.max.x, 2) - toFixed(body.bounds.min.x, 2)) / 2,
          y:
            toFixed(body.position.y, 2) -
            (toFixed(body.bounds.max.y, 2) - toFixed(body.bounds.min.y, 2)) / 2,
          width,
          height,
          fill,
        });
      }
    },
    [width, height, fill]
  );

  useMatter({
    id,
    getBody,
    onUpdate,
  });

  return <RectGraphics ref={geometryRef} />;
};

export default Rect;
