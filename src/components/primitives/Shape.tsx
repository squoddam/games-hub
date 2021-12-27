import { Graphics } from '@inlet/react-pixi';
import { Graphics as PixiGraphics } from 'pixi.js';
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

type OnClickType = () => void;

type RenderFnType = (g: PixiGraphics, props: any) => void;

export type ShapeProps = {
  onClick?: OnClickType;
  stroke?: number;
  strokeWidth?: number;
  fill?: number;
  fillAlpha?: number;
  renderFn: RenderFnType;
} & { [key: string]: any };

export type ShapeRefType = {
  draw: (nextProps: Partial<ShapeProps>) => void;
};

const decorateRender =
  (renderFn: RenderFnType): RenderFnType =>
  (g, props) => {
    const {
      stroke,
      fillAlpha = 1,
      strokeWidth = 1,
      fill = 0x000000,
      filters,
    } = props;
    g.clear();

    if (stroke !== undefined) {
      g.lineStyle(strokeWidth, stroke);
    } else {
      g.lineStyle(0);
    }

    g.beginFill(fill, fillAlpha);

    renderFn(g, props);

    g.endFill();

    if (filters) {
      g.filters = filters;
    }
  };

const Shape = forwardRef(({ onClick, renderFn, ...props }: ShapeProps, ref) => {
  const gRef = useRef<PixiGraphics | null>(null);

  const draw = (nextProps: Partial<ShapeProps>) => {
    if (gRef.current) {
      decorateRender(renderFn)(gRef.current, { ...props, ...nextProps });
    }
  };

  useImperativeHandle(ref, () => ({
    draw,
  }));

  useEffect(() => {
    draw(props);
  }, [props]);

  const onClickRef = useRef<OnClickType | null>(null);

  useEffect(() => {
    if (onClick && onClickRef.current !== onClick) {
      const g = gRef.current;

      if (!g) {
        return;
      }

      if (!g.interactive) {
        g.interactive = true;
      }

      if (onClickRef.current) {
        g.removeListener('pointerdown', onClickRef.current);
      }

      g.addListener('pointerdown', onClick);

      onClickRef.current = onClick;
    }
  }, [onClick]);

  return <Graphics ref={gRef} />;
});

Shape.displayName = 'Shape';

export default Shape;
