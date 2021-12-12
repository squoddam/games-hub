import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import * as PIXI from 'pixi.js';
import { EventSystem } from '@pixi/events';
import { Container, Stage, useApp } from '@inlet/react-pixi';
import Rect from '@/components/primitives/Rect';
import { MatterProvider } from './MatterCtx';
import Walls, { MatterRect } from './components/Walls';
import { COLLISION, WORLD_SIZE } from './constants';
import Ball from './components/Ball';
import { nanoid } from 'nanoid';
import { ACTIONS, storeCtx, StoreProvider } from './storeCtx';

const MENU_SIZE = 100;

const Game = ({ sideSize }) => {
  const { store, dispatch } = useContext(storeCtx);

  const { balls, obstacles } = store;

  const containerRef = useRef<PIXI.Container>(null);

  const ballsLoop = useCallback(() => {
    setInterval(() => {
      const id = nanoid();

      dispatch({
        type: ACTIONS.ADD_BALL,
        payload: { id, x: 100, y: 100, radius: 30 },
      });
    }, 1000);
  }, []);

  useEffect(() => {
    ballsLoop();

    if (containerRef.current) {
      containerRef.current.interactive = true;
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
  }, []);

  const handleBallCollision = useCallback(
    (
      { idA: ballId, idB: otherId }: { idA: string; idB: string },
      { bodyA: ballBody, bodyB: otherBody }: Matter.IPair
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
        {balls.map(({ id, x, y, radius }) => (
          <Ball
            key={id}
            id={id}
            x={x}
            y={y}
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
