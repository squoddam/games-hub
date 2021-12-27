import Matter, { Composite, Engine, Events, Runner, World } from 'matter-js';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import * as PIXI from 'pixi.js';
import { Container, useApp } from '@inlet/react-pixi';
import { UseMatterProps } from './types';
import { nanoid } from 'nanoid';

const engine = Engine.create();
engine.timing.timeScale = 0.2;

export const MatterCtx = React.createContext<{
  container: PIXI.Container | null;
  setCollisionListener: (x: {
    id: string;
    body: Matter.Body;
    listener: (ids: { idA: string; idB: string }, pair: Matter.IPair) => void;
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
    id,
    body,
    listener,
  }: {
    id: string;
    body: Matter.Body;
    listener: (ids: { idA: string; idB: string }, pair: Matter.IPair) => void;
  }) => {
    collisionListeners.current.set(body, { id, listener, body });

    Events.on(engine, 'collisionStart', (event) => {
      const { pairs } = event;
      pairs.forEach((pair) => {
        const { bodyA, bodyB } = pair;
        const [configA, configB] = [
          collisionListeners.current.get(bodyA),
          collisionListeners.current.get(bodyB),
        ];

        configA?.listener(
          {
            idA: configA?.id,
            idB: configB?.id,
          },
          pair
        );

        configB?.listener(
          {
            idA: configB?.id,
            idB: configA?.id,
          },
          {
            ...pair,
            bodyA: bodyB,
            bodyB: bodyA,
          }
        );
      });
    });
  };

  const removeCollisionListener = (body: Matter.Body) => {
    collisionListeners.current.delete(body);
  };

  useEffect(() => {
    Runner.run(engine);
  }, [pixiApp]);

  const [container, setContainer] = useState<PIXI.Container | null>(null);
  const containerRef = useRef<PIXI.Container>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.interactive = true;
      setContainer(containerRef.current);
    }
  }, []);

  return (
    <Container ref={containerRef} name="matter">
      <MatterCtx.Provider
        value={{
          container, // TODO: remove this
          setCollisionListener,
          removeCollisionListener,
        }}
      >
        {children}
      </MatterCtx.Provider>
    </Container>
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
        id: bodyId,
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
