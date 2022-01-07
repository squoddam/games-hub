import Matter, { Engine, Events, Runner, World } from 'matter-js';
import React, { useContext, useEffect, useMemo, useRef } from 'react';

import { useApp } from '@inlet/react-pixi';
import { UseMatterProps } from './types';
import { nanoid } from 'nanoid';

const engine = Engine.create();
engine.timing.timeScale = 0.2;

export const MatterCtx = React.createContext<{
  setCollisionListener: (x: {
    body: Matter.Body;
    listener: (pair: Matter.IPair) => void;
  }) => void;
  removeCollisionListener: (body: Matter.Body) => void;
}>({});

type MatterProviderProps = {
  children: React.ReactElement;
};

export const MatterProvider = ({ children }: MatterProviderProps) => {
  const pixiApp = useApp();

  const collisionListeners = useRef(new Map());

  const setCollisionListener = ({
    body,
    listener,
  }: {
    body: Matter.Body;
    listener: (pair: Matter.IPair) => void;
  }) => {
    collisionListeners.current.set(body, { listener, body });

    Events.on(engine, 'collisionStart', (event) => {
      const { pairs } = event;
      pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const [configA, configB] = [
          collisionListeners.current.get(bodyA),
          collisionListeners.current.get(bodyB),
        ];

        configA?.listener(pair);

        configB?.listener({
          ...pair,
          bodyA: bodyB,
          bodyB: bodyA,
        });
      });
    });
  };

  const removeCollisionListener = (body: Matter.Body) => {
    collisionListeners.current.delete(body);
  };

  useEffect(() => {
    Runner.run(engine);
  }, [pixiApp]);

  return (
    <MatterCtx.Provider
      value={{
        setCollisionListener,
        removeCollisionListener,
      }}
    >
      {children}
    </MatterCtx.Provider>
  );
};

export const useMatter = ({ id, body, onCollision }: UseMatterProps) => {
  const pixiApp = useApp();
  const bodyId = useMemo(() => id || nanoid(), [id]);

  const { setCollisionListener, removeCollisionListener } =
    useContext(MatterCtx);

  useEffect(() => {
    World.addBody(engine.world, body);

    if (onCollision) {
      setCollisionListener({
        body,
        listener: onCollision,
      });
    }

    return () => {
      if (onCollision) {
        removeCollisionListener(body);
      }

      World.remove(engine.world, body);
    };
  }, [
    bodyId,
    body,
    onCollision,
    pixiApp,
    setCollisionListener,
    removeCollisionListener,
  ]);

  return null;
};
