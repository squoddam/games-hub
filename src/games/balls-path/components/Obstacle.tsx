import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Graphics, InteractionEvent } from 'pixi.js';
import { Container } from '@inlet/react-pixi';

import RectGraphics from '@/components/primitives/RectGraphics';
import CircleGraphics from '@/components/primitives/CircleGraphics';

import { COLLISION, MENU_SIZE, WORLD_SIZE } from '../constants';
import { ObstacleType } from '../types';
import { ACTIONS, storeCtx } from '../storeCtx';
import RectBody from './matterBodies/RectBody';
import Pie from './Pie';

const OBSTACLE_WIDTH = 100;
const OBSTACLE_HEIGHT = 30;
const LAMP_MARGIN = 2;
const RADIUS = 2;

type ObstacleProps = {
  isSelected: boolean;
  sideSize: number;
} & ObstacleType;

const Obstacle = ({
  id,
  x,
  y,
  rotation,
  isSelected,
  sideSize,
}: ObstacleProps) => {
  const { dispatch } = useContext(storeCtx);
  const [isDragged, setIsDragged] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const currentRotation = useMemo(
    () =>
      isDragged && mousePos
        ? Math.PI - Math.atan2(mousePos.x - x, mousePos.y - y)
        : rotation,
    [isDragged, mousePos, x, y, rotation]
  );

  const options = useMemo(
    () => ({
      isStatic: true,

      angle: currentRotation,
      collisionFilter: {
        category: COLLISION.CATEGORY.OBSTACLE,
        mask: COLLISION.CATEGORY.BALL,
      },
      chamfer: { radius: RADIUS },
    }),
    [currentRotation]
  );

  const containerRef = useRef<Graphics>(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;

      container.interactive = true;

      const handlePointerDown = (event: InteractionEvent) => {
        event.stopPropagation();

        if (!isSelected) {
          dispatch({
            type: ACTIONS.SET_SELECTED_OBSTACLE,
            payload: { selectedObstacleId: id },
          });
        } else {
          setIsDragged(true);
        }
      };

      const handlePointerUp = (event: InteractionEvent) => {
        event.stopPropagation();

        setIsDragged(false);
        dispatch({
          type: ACTIONS.SET_OBSTACLE_ROTATION,
          payload: { id, rotation: currentRotation },
        });
      };

      container.addListener('pointerdown', handlePointerDown);
      container.addListener('pointerup', handlePointerUp);
      container.addListener('pointerupoutside', handlePointerUp);

      return () => {
        container.removeListener('pointerdown', handlePointerDown);
        container.removeListener('pointerup', handlePointerUp);
        container.removeListener('pointerupoutside', handlePointerUp);
      };
    }
  }, [isSelected, id, dispatch, currentRotation]);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;

      container.interactive = true;

      const handlePointerMove = (event: InteractionEvent) => {
        if (isDragged) {
          const getWorldCoords = (num) => (num / sideSize) * WORLD_SIZE;

          const x = getWorldCoords(event.data.global.x) - MENU_SIZE;
          const y = getWorldCoords(event.data.global.y);

          setMousePos({ x, y });
        }
      };

      container.addListener('pointermove', handlePointerMove);

      return () => {
        container.removeListener('pointermove', handlePointerMove);
      };
    }
  }, [isDragged, sideSize]);

  const bodyRef = useRef<Matter.Body>(null);

  useEffect(() => {
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.restitution = 0;
      }
    }, 100);
  }, []);

  return (
    <>
      <RectBody
        ref={bodyRef}
        x={x - OBSTACLE_WIDTH / 2}
        y={y - OBSTACLE_HEIGHT / 2}
        width={OBSTACLE_WIDTH}
        height={OBSTACLE_HEIGHT}
        options={options}
      />
      <Container
        ref={containerRef}
        x={x}
        y={y}
        rotation={currentRotation}
        pivot={{ x, y }}
      >
        {isSelected && (
          <>
            <CircleGraphics
              x={x}
              y={y}
              radius={OBSTACLE_WIDTH * 0.8}
              fillAlpha={0.01}
              stroke={0x000000}
              strokeWidth={4}
            />
            <CircleGraphics x={x} y={y - OBSTACLE_WIDTH * 0.8} radius={5} />
            <Pie
              x={x}
              y={y}
              radius={OBSTACLE_WIDTH * 0.8}
              startAngle={-Math.PI / 2}
              endAngle={-currentRotation - Math.PI / 2}
              fillAlpha={0.3}
            />
          </>
        )}
        <RectGraphics
          x={x - OBSTACLE_WIDTH / 2}
          y={y - OBSTACLE_HEIGHT / 2}
          width={OBSTACLE_WIDTH}
          height={OBSTACLE_HEIGHT}
          options={options}
        />
        <RectGraphics
          x={x - OBSTACLE_WIDTH / 2 + LAMP_MARGIN}
          y={y - OBSTACLE_HEIGHT / 2 + LAMP_MARGIN}
          width={OBSTACLE_WIDTH - LAMP_MARGIN * 2}
          height={LAMP_MARGIN * 2}
          radius={RADIUS}
          fill={0xffffff}
        />
      </Container>
    </>
  );
};

export default memo(Obstacle);
