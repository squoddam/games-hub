import { useCallback, useContext, useEffect, useRef } from 'react';

import * as PIXI from 'pixi.js';
import { Container, Stage, useApp } from '@inlet/react-pixi';
import { nanoid } from 'nanoid';

import RectGraphics from '@/components/primitives/RectGraphics';
import { MatterProvider } from './MatterCtx';
import Walls from './components/Walls';
import { COLLISION, MENU_SIZE, WORLD_SIZE } from './constants';
import Ball from './components/Ball';
import { ACTIONS, GameStatus, storeCtx, StoreProvider } from './storeCtx';
import Start from './components/waypoints/Start';
import Finish from './components/waypoints/Finish';
import Obstacle from './components/Obstacle';

const Game = ({ sideSize }) => {
  const { store, dispatch } = useContext(storeCtx);

  const { waypoints, balls, obstacles, selectedObstacleId } = store;

  const containerRef = useRef<PIXI.Container>(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      container.interactive = true;

      const handlePointerDown = (event: PIXI.InteractionEvent) => {
        const getWorldCoords = (num) => (num / sideSize) * WORLD_SIZE;

        const x = getWorldCoords(event.data.global.x) - MENU_SIZE;
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

      container.addListener('pointerdown', handlePointerDown);

      return () => {
        container.removeListener('pointerdown', handlePointerDown);
      };
    }
  }, [dispatch, selectedObstacleId, sideSize]);

  useEffect(() => {
    dispatch({
      type: ACTIONS.SET_WAYPOINTS,
      payload: {
        waypoints: {
          start: { id: nanoid(), x: 100, y: 100 },
          finish: { id: nanoid(), x: 500, y: 600, rotation: Math.PI },
        },
      },
    });

    dispatch({
      type: ACTIONS.SET_GAME_STATUS,
      payload: { gameStatus: GameStatus.RUNNING },
    });

    setInterval(() => {
      dispatch({
        type: ACTIONS.SET_GAME_STATUS,
        payload: { gameStatus: GameStatus.FINISHED },
      });

      dispatch({
        type: ACTIONS.SET_GAME_STATUS,
        payload: { gameStatus: GameStatus.RUNNING },
      });
    }, 3000);
  }, []);

  const handleBallCollision = useCallback(
    ({ bodyA: ballBody, bodyB: otherBody }: Matter.IPair) => {
      if (otherBody.collisionFilter.category === COLLISION.CATEGORY.WALL) {
        dispatch({ type: ACTIONS.REMOVE_BALL, payload: { id: ballBody.id } });
      }
    },
    []
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

      <Container ref={containerRef} position={{ x: MENU_SIZE, y: 0 }}>
        <RectGraphics
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

        {waypoints.start && <Start {...waypoints.start} />}
        {waypoints.finish && <Finish {...waypoints.finish} />}
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
