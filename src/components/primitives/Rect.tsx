import { Graphics as PixiGraphics } from 'pixi.js';
import { forwardRef } from 'react';
import Shape, { ShapeProps } from './Shape';

type RectProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
} & Omit<ShapeProps, 'renderFn'>;

const renderFn = (g: PixiGraphics, props: RectProps) => {
  const { x, y, width, height, radius = 0 } = props;

  g.drawRoundedRect(x, y, width, height, radius);
};

const Rect = forwardRef((props: RectProps, ref) => (
  <Shape ref={ref} {...props} renderFn={renderFn} />
));

Rect.displayName = 'Rect';

export default Rect;
