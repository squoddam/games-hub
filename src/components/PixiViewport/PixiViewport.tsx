import { PixiComponent, useApp } from '@inlet/react-pixi';
import { Application } from '@pixi/app';
import { Rectangle } from '@pixi/math';
import { IViewportOptions, Viewport } from 'pixi-viewport';
import { forwardRef, ReactNode, useEffect } from 'react';

type ViewportProps = {
  app: Application;
  plugins?: string[];
  screenWidth: number;
  screenHeight: number;
  worldWidth: number;
  worldHeight: number;
} & IViewportOptions &
  ReactNode;

const PixiViewportComponent = PixiComponent<ViewportProps, Viewport>(
  'Viewport',
  {
    create(props) {
      // @ts-ignore
      const { app, ...viewportProps } = props;

      const viewport = new Viewport({
        ticker: app.ticker,
        interaction: app.renderer.plugins.interaction,
        ...viewportProps,
      });

      return viewport;
    },
    applyProps(viewport, _oldProps, _newProps) {
      const {
        plugins: oldPlugins,
        // @ts-ignore
        children: oldChildren,
        screenWidth: oldScreenWidth,
        screenHeight: oldScreenHeight,
        ...oldProps
      } = _oldProps;
      const {
        plugins: newPlugins,
        // @ts-ignore
        children: newChildren,
        screenWidth: newScreenWidth,
        screenHeight: newScreenHeight,
        ...newProps
      } = _newProps;

      Object.keys(newProps).forEach((p) => {
        // @ts-ignore
        if (oldProps[p] !== newProps[p]) {
          // @ts-ignore
          viewport[p] = newProps[p];
        }
      });

      if (
        [
          [oldScreenWidth, newScreenWidth],
          [oldScreenHeight, newScreenHeight],
        ].some(([oldVal, newVal]) => oldVal !== newVal)
      ) {
        viewport.setZoom(newScreenHeight / newProps.worldHeight);
        viewport.forceHitArea = new Rectangle(
          0,
          0,
          viewport.worldWidth,
          viewport.worldHeight
        );
      }
    },
    didMount() {
      console.log('viewport mounted');
    },
  }
);

const PixiViewport: React.FC<Omit<ViewportProps, 'app'>> = forwardRef<
  Viewport,
  Omit<ViewportProps, 'app'>
>((props, ref) => (
  <PixiViewportComponent ref={ref} app={useApp()} {...props} />
));

PixiViewport.displayName = 'PixiViewport';

export default PixiViewport;
