import Matter, { Engine, Events, Runner, World } from 'matter-js';
import React, { useContext, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@inlet/react-pixi';
import { nanoid } from 'nanoid';

import { UseMatterProps } from './types';

const engine = Engine.create();
engine.timing.timeScale = 0.2;

export const MatterCtx = React.createContext<{
  setCollisionListener: (x: {
    body: Matter.Body;
    listener: (pair: Matter.IPair) => void;
  }) => (body: Matter.Body) => void;
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

    const handleCollisionStart = (
      event: Matter.IEventCollision<Matter.Engine>
    ) => {
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
    };

    Events.on(engine, 'collisionStart', handleCollisionStart);

    return () => {
      Events.off(engine, 'collisionStart', handleCollisionStart);

      collisionListeners.current.delete(body);
    };
  };

  useEffect(() => {
    const runner = Runner.run(engine);

    return () => {
      Runner.stop(runner);
    };
  }, [pixiApp]);

  return (
    <MatterCtx.Provider
      value={{
        setCollisionListener,
      }}
    >
      {children}
    </MatterCtx.Provider>
  );
};

export const useMatter = ({ id, body, onCollision }: UseMatterProps) => {
  const pixiApp = useApp();
  const bodyId = useMemo(() => id || nanoid(), [id]);

  const { setCollisionListener } = useContext(MatterCtx);

  useEffect(() => {
    World.addBody(engine.world, body);

    let removeCollisionListener: (body: Matter.Body) => void;
    if (onCollision) {
      removeCollisionListener = setCollisionListener({
        body,
        listener: onCollision,
      });
    }

    return () => {
      if (removeCollisionListener) {
        removeCollisionListener(body);
      }

      World.remove(engine.world, body);
    };
  }, [bodyId, body, onCollision, pixiApp, setCollisionListener]);

  return null;
};
