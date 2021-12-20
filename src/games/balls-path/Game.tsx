import { useCallback, useContext, useEffect, useRef } from 'react';

import * as PIXI from 'pixi.js';
import { Container, Stage, useApp } from '@inlet/react-pixi';
import { nanoid } from 'nanoid';

import Rect from '@/components/primitives/Rect';
import { MatterProvider } from './MatterCtx';
import Walls from './components/Walls';
import { COLLISION, WORLD_SIZE } from './constants';
import Ball from './components/Ball';
import { ACTIONS, GameStatus, storeCtx, StoreProvider } from './storeCtx';
import { default as MatterRect } from './components/matterBodies/Rect';
import Start from './components/waypoints/Start';

const MENU_SIZE = 100;

const Game = ({ sideSize }) => {
  const { store, dispatch } = useContext(storeCtx);

  const { waypoints, balls, obstacles } = store;

  const containerRef = useRef<PIXI.Container>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.interactive = true;
      containerRef.current.addListener('pointermove', (event) => {
        const getWorldCoords = (num) => (num / sideSize) * WORLD_SIZE;
        const x = getWorldCoords(event.data.global.x) - MENU_SIZE;
        const y = getWorldCoords(event.data.global.y);

        dispatch({
          type: ACTIONS.SET_MOUSE_POSITION,
          payload: { mousePos: { x, y } },
        });
      });
      containerRef.current.addListener('pointerdown', (event) => {
        const getWorldCoords = (num) => (num / sideSize) * WORLD_SIZE;

        const x = getWorldCoords(event.data.global.x) - MENU_SIZE;
        const y = getWorldCoords(event.data.global.y);

        const obstacleId = nanoid();

        dispatch({
          type: ACTIONS.ADD_OBSTACLE,
          payload: { id: obstacleId, x, y },
        });
      });
    }

    dispatch({
      type: ACTIONS.SET_WAYPOINTS,
      payload: {
        waypoints: {
          start: { id: nanoid(), x: 500, y: 500, rotation: Math.PI / 2 },
          end: { id: nanoid(), x: 200, y: 200 },
        },
      },
    });
  }, []);

  const handleBallCollision = useCallback(
    (
      { idA: ballId }: { idA: string; idB: string },
      { bodyB: otherBody }: Matter.IPair
    ) => {
      if (otherBody.collisionFilter.category === COLLISION.CATEGORY.WALL) {
        dispatch({ type: ACTIONS.REMOVE_BALL, payload: { id: ballId } });
      }
    },
    []
  );

  return (
    <Container name="game">
      <Rect
        x={0}
        y={0}
        width={WORLD_SIZE}
        height={WORLD_SIZE}
        radius={0}
        fill={0xffffff}
        stroke={0x000000}
        strokeWidth={3}
      />

      <Container ref={containerRef} position={{ x: MENU_SIZE, y: 0 }}>
        <Rect
          x={0}
          y={0}
          width={WORLD_SIZE - MENU_SIZE}
          height={WORLD_SIZE - MENU_SIZE}
          radius={0}
          fill={0xffffff}
          stroke={0x000000}
          strokeWidth={0}
        />
        <Walls wallSize={WORLD_SIZE - MENU_SIZE} />
        {balls.map(({ id, x, y, radius, force }) => (
          <Ball
            key={id}
            id={id}
            x={x}
            y={y}
            force={force}
            radius={radius}
            onCollision={handleBallCollision}
          />
        ))}
        {obstacles.map(({ id, x, y }) => (
          <MatterRect
            id={id}
            key={id}
            x={x}
            y={y}
            width={200}
            height={50}
            options={{
              isStatic: true,
              collisionFilter: { category: COLLISION.CATEGORY.OBSTACLE },
            }}
          />
        ))}

        {waypoints.start && <Start {...waypoints.start} />}
      </Container>
    </Container>
  );
};

const STAGE_OPTIONS = {
  antialias: true,
  autoDensity: true,
  backgroundColor: 0xffffff,
  backgroundAlpha: 0,
};

const Board = ({ sideSize }) => {
  const containerRef = useRef<PIXI.Container>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scale.set(sideSize / WORLD_SIZE);
    }
  }, [sideSize]);

  if (sideSize === 0) {
    return null;
  }

  return (
    <Stage width={sideSize} height={sideSize} options={STAGE_OPTIONS}>
      <Container ref={containerRef} name="board">
        <StoreProvider>
          <MatterProvider>
            <Game sideSize={sideSize} />
          </MatterProvider>
        </StoreProvider>
      </Container>
    </Stage>
  );
};

export default Board;
