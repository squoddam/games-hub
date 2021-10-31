import { PixiComponent, useApp } from '@inlet/react-pixi';
import { Application } from '@pixi/app';
import { IViewportOptions, Viewport } from 'pixi-viewport';
import { forwardRef, ReactNode } from 'react';

type ViewportProps = {
  app: Application;
  plugins?: string[];
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

      // activate plugins
      (props.plugins || []).forEach((plugin) => {
        // @ts-ignore
        viewport[plugin]();
      });

      setImmediate(() => {
        // @ts-ignore
        viewport.fit(false, props.worldWidth, props.worldHeight);
      });

      return viewport;
    },
    applyProps(viewport, _oldProps, _newProps) {
      const {
        plugins: oldPlugins,
        // @ts-ignore
        children: oldChildren,
        ...oldProps
      } = _oldProps;
      const {
        plugins: newPlugins,
        // @ts-ignore
        children: newChildren,
        ...newProps
      } = _newProps;

      Object.keys(newProps).forEach((p) => {
        // @ts-ignore
        if (oldProps[p] !== newProps[p]) {
          // @ts-ignore
          viewport[p] = newProps[p];
        }
      });
    },
    didMount() {
      console.log('viewport mounted');
    },
  }
);

// create a component that can be consumed
// that automatically pass down the app
const PixiViewport = forwardRef<Viewport, Omit<ViewportProps, 'app'>>(
  (props, ref) => <PixiViewportComponent ref={ref} app={useApp()} {...props} />
) as React.FC<Omit<ViewportProps, 'app'>>;

export default PixiViewport;
