import { memo, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Matter from 'matter-js';
import { Graphics, InteractionEvent } from 'pixi.js';
import { Container } from '@inlet/react-pixi';

import RectGraphics from '@/components/primitives/RectGraphics';
import CircleGraphics from '@/components/primitives/CircleGraphics';

import { COLLISION, WORLD_SIZE } from '../constants';
import { ObstacleType } from '../types';
import { ACTIONS, storeCtx } from '../storeCtx';
import RectBody from './matterBodies/RectBody';
import Pie from './Pie';
import { Point } from '@/types';

const OBSTACLE_WIDTH = 100;
const OBSTACLE_HEIGHT = 30;
const LAMP_MARGIN = 2;
const RADIUS = 2;

type ObstacleProps = {
  isSelected: boolean;
  sideSize: number;
} & ObstacleType;

const getCoordsFromMouse = (
  sideSize: ObstacleProps['sideSize'],
  event: InteractionEvent
) => {
  const getWorldCoords = (num: number) => (num / sideSize) * WORLD_SIZE;

  const x = getWorldCoords(event.data.global.x);
  const y = getWorldCoords(event.data.global.y);

  return { x, y };
};

const getRotationFromMouse = (
  sideSize: ObstacleProps['sideSize'],
  event: InteractionEvent,
  { x, y }: Point
) => {
  const { x: mouseX, y: mouseY } = getCoordsFromMouse(sideSize, event);

  return Math.PI - Math.atan2(mouseX - x, mouseY - y);
};

const Obstacle = ({
  id,
  x,
  y,
  rotation,
  isSelected,
  sideSize,
}: ObstacleProps) => {
  const { dispatch } = useContext(storeCtx);
  const [isRotationDragged, setIsRotationDragged] = useState(false);
  const [mainDragDiff, setMainDragDiff] = useState<Point | null>({
    x: 0,
    y: 0,
  });
  const [mousePos, setMousePos] = useState<Point | null>(null);

  const currentRotation = useMemo(
    () =>
      !mainDragDiff && isRotationDragged && mousePos
        ? Math.PI - Math.atan2(mousePos.x - x, mousePos.y - y)
        : rotation,
    [isRotationDragged, mousePos, x, y, rotation, mainDragDiff]
  );

  const options = useMemo(
    () => ({
      isStatic: true,
      isSensor: mainDragDiff !== null,

      angle: currentRotation,
      collisionFilter: {
        category: COLLISION.CATEGORY.OBSTACLE,
        mask:
          COLLISION.CATEGORY.BALL |
          COLLISION.CATEGORY.BIN |
          COLLISION.CATEGORY.OBSTACLE,
      },
      chamfer: { radius: RADIUS },
    }),
    [currentRotation, mainDragDiff]
  );

  const containerRef = useRef<Graphics>(null);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;

      container.interactive = true;

      const handleMouseDown = (event: InteractionEvent) => {
        event.stopPropagation();

        if (!isSelected) {
          dispatch({
            type: ACTIONS.SET_SELECTED_OBSTACLE,
            payload: { selectedObstacleId: id },
          });
        } else {
          setIsRotationDragged(true);
        }
      };

      const handleMouseUp = (event: InteractionEvent) => {
        event.stopPropagation();

        if (isRotationDragged) {
          dispatch({
            type: ACTIONS.SET_OBSTACLE_ROTATION,
            payload: {
              id,
              rotation: getRotationFromMouse(sideSize, event, { x, y }),
            },
          });
        }

        setIsRotationDragged(false);
      };

      container.addListener('mousedown', handleMouseDown);
      container.addListener('mouseup', handleMouseUp);
      container.addListener('mouseupoutside', handleMouseUp);

      return () => {
        container.removeListener('mousedown', handleMouseDown);
        container.removeListener('mouseup', handleMouseUp);
        container.removeListener('mouseupoutside', handleMouseUp);
      };
    }
  }, [dispatch, id, isRotationDragged, isSelected, sideSize, x, y]);

  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;

      container.interactive = true;

      const handleMouseMove = (event: InteractionEvent) => {
        if (isRotationDragged || mainDragDiff) {
          setMousePos(getCoordsFromMouse(sideSize, event));
        } else {
          setMousePos(null);
        }
      };

      container.addListener('pointermove', handleMouseMove);

      return () => {
        container.removeListener('pointermove', handleMouseMove);
      };
    }
  }, [isRotationDragged, sideSize, mainDragDiff]);

  const bodyRef = useRef<Matter.Body>(null);

  useEffect(() => {
    setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.restitution = 0;
      }
    }, 100);
  }, []);

  const mainRef = useRef<{ g: Graphics }>(null);

  useEffect(() => {
    if (mainRef.current?.g) {
      const main = mainRef.current.g;

      main.interactive = true;

      const handleMouseDown = (event: InteractionEvent) => {
        event.stopPropagation();
        if (!isSelected) {
          dispatch({
            type: ACTIONS.SET_SELECTED_OBSTACLE,
            payload: { selectedObstacleId: id },
          });
        }

        const { x: mouseX, y: mouseY } = getCoordsFromMouse(sideSize, event);

        setMainDragDiff({ x: mouseX - x, y: mouseY - y });
      };

      const handleMouseUp = (event: InteractionEvent) => {
        const { x: mouseX, y: mouseY } = getCoordsFromMouse(sideSize, event);

        if (mainDragDiff !== null) {
          dispatch({
            type: ACTIONS.SET_OBSTACLE_POSITION,
            payload: {
              id,
              x: mouseX - mainDragDiff.x,
              y: mouseY - mainDragDiff.y,
            },
          });
        }

        setMainDragDiff(null);
      };

      const handleRightClick = () => {
        dispatch({
          type: ACTIONS.REMOVE_OBSTACLE,
          payload: { id },
        });

        if (isSelected) {
          dispatch({
            type: ACTIONS.SET_SELECTED_OBSTACLE,
            payload: { selectedObstacleId: null },
          });
        }
      };

      main.addListener('mousedown', handleMouseDown);
      main.addListener('mouseup', handleMouseUp);
      main.addListener('rightclick', handleRightClick);

      return () => {
        main.removeListener('mousedown', handleMouseDown);
        main.removeListener('mouseup', handleMouseUp);
        main.removeListener('rightclick', handleRightClick);
      };
    }
  }, [mousePos, dispatch, id, sideSize, x, y, isSelected, mainDragDiff]);

  const finalPos = useMemo(
    () => ({
      x: mousePos && mainDragDiff !== null ? mousePos.x - mainDragDiff.x : x,
      y: mousePos && mainDragDiff !== null ? mousePos.y - mainDragDiff.y : y,
    }),
    [mainDragDiff, mousePos, x, y]
  );

  return (
    <>
      <RectBody
        ref={bodyRef}
        x={finalPos.x - OBSTACLE_WIDTH / 2}
        y={finalPos.y - OBSTACLE_HEIGHT / 2}
        width={OBSTACLE_WIDTH}
        height={OBSTACLE_HEIGHT}
        options={options}
      />
      <Container
        ref={containerRef}
        x={finalPos.x}
        y={finalPos.y}
        rotation={currentRotation}
        pivot={{ x, y }}
      >
        {isSelected && !mainDragDiff && (
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
          ref={mainRef}
          x={x - OBSTACLE_WIDTH / 2}
          y={y - OBSTACLE_HEIGHT / 2}
          width={OBSTACLE_WIDTH}
          height={OBSTACLE_HEIGHT}
          options={options}
          fillAlpha={mainDragDiff !== null ? 0.3 : 1}
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
