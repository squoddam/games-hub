import { useEffect, useRef, useState } from 'react';
import { Engine, Bodies, World, Runner } from 'matter-js';

import * as PIXI from 'pixi.js';
import { Container, Stage, useApp } from '@inlet/react-pixi';
import PixiViewport from '@/components/PixiViewport';
import Rect from '@/components/primitives/Rect';
import { MatterProvider } from './MatterCtx';
import Walls from './components/Walls';
import { WORLD_SIZE } from './constants';
import Ball from './components/Ball';

type BallInfo = {
  x: number;
  y: number;
  radius: number;
};

const balls: BallInfo[] = [
  {
    x: 10,
    y: 10,
    radius: 10,
  },
];

const Game = () => {
  const pixiApp = useApp();
  const [balls, setBalls] = useState<BallInfo[]>([]);

  const containerRef = useRef<PIXI.Container>(null);

  useEffect(() => {
    setBalls([{ x: 100, y: 100, radius: 30 }]);

    pixiApp.view.addEventListener('click', (...args) => {
      console.log(args);
    });
  }, []);

  return (
    <MatterProvider>
      <Container ref={containerRef}>
        <Walls />
        {balls.map(({ x, y, radius }) => (
          <Ball key={x + y} x={x} y={y} radius={radius} />
        ))}
      </Container>
    </MatterProvider>
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
      <Container ref={containerRef}>
        <Game />
      </Container>
    </Stage>
  );
};

export default Board;
