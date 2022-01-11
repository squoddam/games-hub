import { useCallback, useContext, useEffect, useRef, useState } from 'react';

import * as PIXI from 'pixi.js';
import { Container, Stage, useApp } from '@inlet/react-pixi';
import { nanoid } from 'nanoid';

import RectGraphics from '@/components/primitives/RectGraphics';

import LEVELS from './levels.json';
import { MatterProvider } from './MatterCtx';
import Walls from './components/Walls';
import { COLLISION, REQUIRED_AMOUNT, WORLD_SIZE } from './constants';
import Ball from './components/Ball';
import { ACTIONS, storeCtx, StoreProvider } from './storeCtx';
import Start from './components/waypoints/Start';
import Finish from './components/waypoints/Finish';
import Obstacle from './components/Obstacle';
import { LevelType } from './types';

type GameProps = {
  sideSize: number;
  level: LevelType;
  onFinish: () => void;
};

const Game = ({ sideSize, level, onFinish }: GameProps) => {
  const app = useApp();
  const { store, dispatch } = useContext(storeCtx);

  const { balls, obstacles, selectedObstacleId, collectedAmount } = store;

  useEffect(() => {
    if (collectedAmount >= REQUIRED_AMOUNT) {
      onFinish();
    }
  }, [collectedAmount, onFinish]);

  const containerRef = useRef<PIXI.Container>(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.interactive = true;

      const handleMouseDown = (event: PIXI.InteractionEvent) => {
        const getWorldCoords = (num: number): number => (num / sideSize) * WORLD_SIZE;

        const x = getWorldCoords(event.data.global.x);
        const y = getWorldCoords(event.data.global.y);

        const obstacleId = nanoid();

        if (!selectedObstacleId) {
          dispatch({
            type: ACTIONS.ADD_OBSTACLE,
            payload: { id: obstacleId, x, y, rotation: 0 },
          });
        }

        dispatch({
          type: ACTIONS.SET_SELECTED_OBSTACLE,
          payload: { selectedObstacleId: null },
        });
      };

      container.addListener('mousedown', handleMouseDown);

      const handleContextMenu = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
      };

      app.renderer.view.addEventListener('contextmenu', handleContextMenu);

      return () => {
        container.removeListener('mousedown', handleMouseDown);
        app.renderer?.view.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [app.renderer.view, dispatch, selectedObstacleId, sideSize]);

  const handleBallCollision = useCallback(
    ({ bodyA: ballBody, bodyB: otherBody }: Matter.IPair) => {
      if (otherBody.collisionFilter.category === COLLISION.CATEGORY.WALL) {
        dispatch({ type: ACTIONS.REMOVE_BALL, payload: { id: ballBody.id } });
        dispatch({
          type: ACTIONS.SET_COLLECTED_AMOUNT,
          payload: { collectedAmount: 0 },
        });
      }
    },
    [dispatch]
  );

  return (
    <Container name="game">
      <RectGraphics
        x={0}
        y={0}
        width={WORLD_SIZE}
        height={WORLD_SIZE}
        radius={0}
        fill={0xffffff}
        stroke={0x000000}
        strokeWidth={3}
      />

      <Container ref={containerRef} position={{ x: 0, y: 0 }}>
        <RectGraphics
          x={0}
          y={0}
          width={WORLD_SIZE}
          height={WORLD_SIZE}
          radius={0}
          fill={0xffffff}
          stroke={0x000000}
          strokeWidth={0}
        />
        <Walls wallSize={WORLD_SIZE} />
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
        {obstacles.map(({ id, x, y, rotation }) => (
          <Obstacle
            sideSize={sideSize}
            key={id}
            id={id}
            x={x}
            y={y}
            rotation={rotation}
            isSelected={selectedObstacleId === id}
          />
        ))}

        {level.start && <Start {...level.start} />}
        {level.finish && <Finish {...level.finish} />}
      </Container>
    </Container>
  );
};

type BoardProps = {
  sideSize: number;
  currentLevel: number;
  onFinish: () => void;
};

const STAGE_OPTIONS = {
  antialias: true,
  autoDensity: true,
  backgroundColor: 0xffffff,
  backgroundAlpha: 0,
};

const Board = ({ sideSize, currentLevel, onFinish }: BoardProps) => {
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
            <Game
              sideSize={sideSize}
              level={LEVELS[currentLevel]}
              onFinish={onFinish}
            />
          </MatterProvider>
        </StoreProvider>
      </Container>
    </Stage>
  );
};

export default Board;
