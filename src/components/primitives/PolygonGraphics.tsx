import { Graphics } from '@pixi/graphics';
import { Point, Polygon } from 'pixi.js';
import { forwardRef } from 'react';
import Shape, { ShapeProps } from './Shape';

export type PolygonGraphicsProps = {
  path: number[] | Point[] | Polygon;
} & Omit<ShapeProps, 'renderFn'>;

const renderFn = (g: Graphics, props: PolygonGraphicsProps) => {
  const { path } = props;

  g.drawPolygon(path);
};

const PolygonGraphics = forwardRef((props: PolygonGraphicsProps, ref) => (
  <Shape ref={ref} {...props} renderFn={renderFn} />
));

PolygonGraphics.displayName = 'Polygon';

export default PolygonGraphics;
