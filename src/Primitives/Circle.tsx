import { Graphics } from '@pixi/graphics';
import Shape, { ShapeProps } from './Shape';

type CircleProps = {
  x: number;
  y: number;
  radius: number;
} & Omit<ShapeProps, 'renderFn'>;

const renderFn = (g: Graphics, props: CircleProps) => {
  const { x, y, radius } = props;

  g.drawCircle(x, y, radius);
};

const Circle = (props: CircleProps) => <Shape {...props} renderFn={renderFn} />;

export default Circle;
