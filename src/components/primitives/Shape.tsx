import { Graphics } from '@inlet/react-pixi';
import { Graphics as PixiGraphics } from 'pixi.js';
import { useAnime } from '../../hooks';
import { useEffect, useRef } from 'react';
import anime from 'animejs';

type OnClickType = () => void;

type RenderFnType = (g: PixiGraphics, props: any) => void;

export type ShapeProps = {
  onClick?: OnClickType;
  coordsKey?: string;
  animConfig?: anime.AnimeParams;
  stroke?: number;
  strokeWidth?: number;
  fill?: number;
  renderFn: RenderFnType;
} & { [key: string]: any };

const decorateRender =
  (renderFn: RenderFnType): RenderFnType =>
  (g, props) => {
    const { stroke, strokeWidth = 1, fill = 0x000000 } = props;
    g.clear();

    if (stroke !== undefined) {
      g.lineStyle(strokeWidth, stroke);
    } else {
      g.lineStyle(0);
    }

    g.beginFill(fill);

    renderFn(g, props);

    g.endFill();
  };

function Shape({ onClick, animConfig, renderFn, ...props }: ShapeProps) {
  const gRef = useRef<PixiGraphics | null>(null);

  useAnime({
    toProps: props,
    onUpdate: (nextProps) => {
      if (gRef.current) {
        const g = gRef.current;

        decorateRender(renderFn)(g, nextProps);
      }
    },
    config: animConfig,
  });

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
}

export default Shape;
