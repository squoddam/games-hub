import anime from 'animejs';
import { nanoid } from 'nanoid';
import { useEffect, useRef } from 'react';

type AnyObject = Record<string, any>;

type Animation = {
  isFinished: boolean;
  toProps: AnyObject;
};

const animations: Record<string, Animation> = {};

export const addToAnimations = <T>({
  fromProps,
  toProps,
  onUpdate,
  config,
}: {
  fromProps: T;
  toProps: T;
  onUpdate: (props: AnyObject) => void;
  config: anime.AnimeParams;
}) => {
  const id = nanoid();

  animations[id] = {
    toProps:
      fromProps && Object.keys(fromProps).length > 0
        ? { ...fromProps }
        : { ...toProps },
    isFinished: false,
  };

  const handleUpdate = () => {
    if (animations[id]) {
      if (animations[id].isFinished) {
        onUpdate(toProps);

        delete animations[id];
      } else {
        onUpdate(animations[id].toProps);
      }
    }
  };

  anime({
    targets: animations[id].toProps,
    ...toProps,
    update: handleUpdate,
    complete: () => {
      animations[id].isFinished = true;
    },

    duration: 1000,
    easing: 'linear',

    ...config,
  });
};

export const useAnime = <T>({
  toProps,
  fromProps,
  onUpdate,
  config = {},
}: {
  fromProps?: T;
  toProps: T;
  onUpdate: (nextState: T) => void;
  config?: anime.AnimeParams;
}) => {
  const fromPropsRef = useRef<T>(fromProps || toProps);

  useEffect(() => {
    addToAnimations({
      fromProps: fromPropsRef.current,
      toProps,
      onUpdate,
      config,
    });
    fromPropsRef.current = toProps;
  }, [fromProps, toProps, onUpdate]);
};
