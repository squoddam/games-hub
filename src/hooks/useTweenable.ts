import { useEffect, useRef } from 'react';
import { shifty, Tweenable } from 'shifty';

export const useTweenable = (
  config: shifty.tweenConfig = {},
  deps: any[] = []
) => {
  const tweenableRef = useRef(new Tweenable());
  const fromRef = useRef(null);

  useEffect(() => {
    if (fromRef.current === null) {
      fromRef.current = config.from || config.to;
    }

    tweenableRef.current
      .tween({
        ...config,
        from: fromRef.current,
      })
      .then(() => {
        fromRef.current = config.to;
      }, console.error);
  }, [deps]);

  return tweenableRef.current;
};
