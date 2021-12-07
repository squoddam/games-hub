import Matter, { Engine, Runner, World } from 'matter-js';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import * as PIXI from 'pixi.js';
import { Container, useApp } from '@inlet/react-pixi';

const engine = Engine.create();

type SceneObject = {
  id: string;
  geometry: PIXI.Graphics;
  body: Matter.Body;
  update: (body: Matter.Body, geometry: PIXI.Graphics) => void;
};

const sceneObjects: SceneObject[] = [];

const MatterCtx = React.createContext<PIXI.Container | null>(null);

type MatterProviderProps = {
  children: React.ReactElement;
};

export const MatterProvider = ({ children }: MatterProviderProps) => {
  const pixiApp = useApp();

  useEffect(() => {
    pixiApp.ticker.add(() => {
      sceneObjects.forEach(({ body, geometry, update }) => {
        update(body, geometry);
      });
    });

    Runner.run(engine);
  }, [pixiApp]);

  const [container, setContainer] = useState<PIXI.Container | null>(null);
  const containerRef = useRef<PIXI.Container>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.interactive = true;
      setContainer(containerRef.current);
    }
  }, [containerRef]);

  return (
    <Container ref={containerRef}>
      <MatterCtx.Provider value={container}>{children}</MatterCtx.Provider>
    </Container>
  );
};

type UseMatterProps = {
  id: string;
  getBody: () => Matter.Body;
  getGeometry: () => PIXI.Graphics;
  update: (body: Matter.Body, geometry: PIXI.Graphics) => void;
};

export const useMatter = ({
  id,
  getBody,
  getGeometry,
  update,
}: UseMatterProps) => {
  const pixiApp = useApp();
  const body = useMemo(() => getBody(), [getBody]);
  const geometry = useMemo(() => getGeometry(), [getGeometry]);

  const container = useContext(MatterCtx);

  useEffect(() => {
    const existingObjIndex = sceneObjects.findIndex(
      ({ id: objId }) => objId === id
    );
    if (existingObjIndex !== -1) {
      sceneObjects[existingObjIndex] = { id, body, geometry, update };
    } else {
      if (container) {
        World.addBody(engine.world, body);
        container.addChild(geometry);

        sceneObjects.push({ id, body, geometry, update });
      }
    }
  }, [id, body, geometry, update, pixiApp, container]);

  return null;
};
