import { Graphics } from '@pixi/graphics';
import { forwardRef } from 'react';
import Shape, { ShapeProps } from './Shape';

type CircleProps = {
  x: number;
  y: number;
  radius: number;
  startAngle?: number;
  endAngle?: number;
  anticlockwise?: boolean;
} & Omit<ShapeProps, 'renderFn'>;

const renderFn = (g: Graphics, props: CircleProps) => {
  const { x, y, radius, startAngle, endAngle, anticlockwise } = props;

  if (startAngle !== undefined && endAngle !== undefined) {
    g.arc(x, y, radius, startAngle, endAngle, anticlockwise !== undefined);
  } else {
    g.drawCircle(x, y, radius);
  }
};

const Circle = forwardRef((props: CircleProps, ref) => (
  <Shape ref={ref} {...props} renderFn={renderFn} />
));

Circle.displayName = 'Circle';

export default Circle;
