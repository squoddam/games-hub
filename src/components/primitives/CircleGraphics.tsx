import { Graphics } from '@pixi/graphics';
import { forwardRef, memo } from 'react';
import Shape, { ShapeProps } from './Shape';

export type CircleGraphicsProps = {
  x: number;
  y: number;
  radius: number;
  startAngle?: number;
  endAngle?: number;
  anticlockwise?: boolean;
} & Omit<ShapeProps, 'renderFn'>;

const renderFn = (g: Graphics, props: CircleGraphicsProps) => {
  const { x, y, radius, startAngle, endAngle, anticlockwise } = props;

  if (startAngle !== undefined && endAngle !== undefined) {
    g.arc(x, y, radius, startAngle, endAngle, anticlockwise !== undefined);
  } else {
    g.drawCircle(x, y, radius);
  }
};

const CircleGraphics = forwardRef((props: CircleGraphicsProps, ref) => (
  <Shape ref={ref} {...props} renderFn={renderFn} />
));

CircleGraphics.displayName = 'Circle';

export default memo(CircleGraphics);
