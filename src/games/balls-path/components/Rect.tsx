import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useTick } from '@inlet/react-pixi';

import { ShapeRefType } from '@/components/primitives/Shape';
import { RectGraphicsProps } from '@/components/primitives/RectGraphics';
import { Body } from 'matter-js';

import RectBody, { RectBodyProps } from './matterBodies/RectBody';
import PolygonGraphics from '@/components/primitives/PolygonGraphics';

type RectProps = RectBodyProps & RectGraphicsProps;

const Rect = forwardRef(
  ({ id, x, y, width, height, fill, options }: RectProps, ref) => {
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
          path: bodyRef.current.vertices,
        });
      }
    });

    return (
      <>
        <RectBody
          ref={bodyRef}
          id={id}
          x={x}
          y={y}
          width={width}
          height={height}
          options={options}
        />
        <PolygonGraphics
          ref={graphicsRef}
          path={[
            { x, y },
            { x: x + width, y },
            { x: x + width, y: y + height },
            { x, y: y + height },
          ]}
        />
      </>
    );
  }
);

Rect.displayName = 'Rect';

export default Rect;
