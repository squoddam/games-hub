import { Graphics as PixiGraphics } from 'pixi.js';
import { forwardRef } from 'react';
import Shape, { ShapeProps } from './Shape';

export type RectGraphicsProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
} & Omit<ShapeProps, 'renderFn'>;

const renderFn = (g: PixiGraphics, props: RectGraphicsProps) => {
  const { x, y, width, height, radius = 0 } = props;

  g.drawRoundedRect(x, y, width, height, radius);
};

const RectGraphics = forwardRef((props: RectGraphicsProps, ref) => (
  <Shape ref={ref} {...props} renderFn={renderFn} />
));

RectGraphics.displayName = 'Rect';

export default RectGraphics;
