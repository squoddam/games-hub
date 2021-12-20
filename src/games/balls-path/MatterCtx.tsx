import Matter, { Composite, Engine, Events, Runner, World } from 'matter-js';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import * as PIXI from 'pixi.js';
import { Container, useApp } from '@inlet/react-pixi';
import { UseMatterProps } from './types';

const engine = Engine.create();
engine.timing.timeScale = 0.5;

type SceneObject = {
  id: string;
  body: Matter.Body;
  onUpdate: (body: Matter.Body) => void;
  onClick?: () => void;
};

const sceneObjects: Record<string, SceneObject> = {};

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
          container,
          setCollisionListener,
          removeCollisionListener,
        }}
      >
        {children}
      </MatterCtx.Provider>
    </Container>
  );
};

export const useMatter = ({
  id,
  getBody,
  onUpdate,
  onClick,
  onCollision,
}: UseMatterProps) => {
  const pixiApp = useApp();
  const body = useMemo(() => getBody(), [getBody]);

  const { container, setCollisionListener, removeCollisionListener } =
    useContext(MatterCtx);

  useEffect(() => {
    const existingObj = sceneObjects[id];

    if (existingObj) {
      sceneObjects[id] = {
        id,
        body,
        onUpdate,
        onClick,
      };
    } else {
      if (container) {
        World.addBody(engine.world, body);

        sceneObjects[id] = { id, body, onUpdate, onClick };

        if (onCollision) {
          setCollisionListener({
            id,
            body,
            listener: onCollision,
          });

          return () => {
            removeCollisionListener(body);
          };
        }
      }
    }
  }, [id, body, onUpdate, onClick, pixiApp, container]);

  useEffect(() => {
    const onTickUpdate = () => {
      const existingObj = sceneObjects[id];

      if (existingObj) {
        existingObj.onUpdate?.(existingObj.body);
      }
    };

    pixiApp.ticker.add(onTickUpdate);

    return () => {
      const existingObj = sceneObjects[id];

      if (existingObj) {
        // existingObj.geometry.destroy();
        Composite.remove(engine.world, existingObj.body);

        // Events.off(mouseConstraint, 'mousedown', existingObj.onClick);

        pixiApp.ticker.remove(onTickUpdate);

        delete sceneObjects[id];
      }
    };
  }, []);

  return null;
};
