import { Graphics as PixiGraphics } from 'pixi.js';
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

const PixiRect = (props: RectProps) => <Shape {...props} renderFn={renderFn} />;

export default PixiRect;
