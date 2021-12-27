import Shape, { ShapeProps } from '@/components/primitives/Shape';
import { Graphics } from 'pixi.js';

type PieProps = {
  x: number;
  y: number;
  radius: number;
  startAngle: number;
  endAngle: number;
} & Omit<ShapeProps, 'renderFn'>;

const renderPie = (
  g: Graphics,
  { x, y, radius, startAngle, endAngle }: PieProps
) =>
  g
    .moveTo(x, y)
    .lineTo(
      x + radius * Math.cos(startAngle),
      y + radius * Math.sin(startAngle)
    )
    .arc(x, y, radius, startAngle, endAngle, endAngle > -Math.PI * 1.5)
    .lineTo(x, y);

const Pie = (props: PieProps) => <Shape {...props} renderFn={renderPie} />;

export default Pie;
