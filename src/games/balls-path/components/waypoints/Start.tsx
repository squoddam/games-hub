import { useContext, useEffect, useMemo, useRef } from 'react';
import { Container } from '@inlet/react-pixi';
import anime from 'animejs';
import { nanoid } from 'nanoid';

import { useAnime } from '@/hooks';

import RectGraphics from '@/components/primitives/RectGraphics';
import CircleGraphics from '@/components/primitives/CircleGraphics';
import { ShapeRefType } from '@/components/primitives/Shape';

import { WaypointBase } from '@balls/types';
import { BALL_SIZE } from '@balls/constants';
import { ACTIONS, GameStatus, storeCtx } from '@balls/storeCtx';

const CANNON_MARGIN = 8;
const FORCE = 0.1;

const ANIM_DURATION = 1;

const Cannon = ({ toFire }: { toFire: boolean }) => {
  const barrel2Ref = useRef<ShapeRefType | null>(null);
  const muzzleRef = useRef<ShapeRefType | null>(null);

  const anime1Config = useMemo(
    () => ({
      targets: { y: BALL_SIZE },
      keyframes: [
        {
          y: BALL_SIZE - CANNON_MARGIN * 2,
          easing: 'linear',
          duration: 100,
        },
        { y: BALL_SIZE, easing: 'easeOutCirc', duration: 300 },
      ],
      config: {
        delay: 50,
      },
      update: (anim: anime.AnimeInstance) => {
        const { y } = anim.animatables[0].target;

        if (barrel2Ref.current) {
          barrel2Ref.current.draw({ y });
        }
      },
      autoplay: false,
    }),
    []
  );

  const anim1 = useAnime(anime1Config);

  const anim2Config = useMemo(
    () => ({
      targets: { y: BALL_SIZE * 2 + CANNON_MARGIN },
      keyframes: [
        {
          y: BALL_SIZE * 2 - CANNON_MARGIN * 2,
          easing: 'linear',
          duration: 100 * ANIM_DURATION,
        },
        {
          y: BALL_SIZE * 2 + CANNON_MARGIN,
          easing: 'easeOutCirc',
          duration: 300 * ANIM_DURATION,
        },
      ],
      update: (anim: anime.AnimeInstance) => {
        const { y } = anim.animatables[0].target;

        if (muzzleRef.current) {
          muzzleRef.current.draw({ y });
        }
      },
      autoplay: false,
    }),
    []
  );

  const anim2 = useAnime(anim2Config);

  useEffect(() => {
    if (toFire) {
      anim1.play();
      anim2.play();
    }
  }, [toFire, anim1, anim2]);

  return (
    <Container>
      <CircleGraphics
        x={0}
        y={0}
        radius={BALL_SIZE}
        startAngle={0}
        endAngle={Math.PI}
        anticlockwise
      />
      <RectGraphics
        x={-BALL_SIZE}
        y={0}
        width={BALL_SIZE * 2}
        height={BALL_SIZE - CANNON_MARGIN}
      />
      <RectGraphics
        ref={barrel2Ref}
        x={-BALL_SIZE}
        y={BALL_SIZE}
        width={BALL_SIZE * 2}
        height={BALL_SIZE}
      />
      <RectGraphics
        ref={muzzleRef}
        x={-CANNON_MARGIN - BALL_SIZE}
        y={BALL_SIZE * 2 + CANNON_MARGIN}
        width={BALL_SIZE * 2 + CANNON_MARGIN * 2}
        height={CANNON_MARGIN}
      />
    </Container>
  );
};

const Start = ({ x, y, rotation = 0 }: WaypointBase) => {
  const { store, dispatch } = useContext(storeCtx);

  const { gameStatus } = store;

  const spawnBall = () => {
    const id = nanoid();

    const force = {
      x: Math.sin(rotation) * FORCE,
      y: Math.cos(rotation) * FORCE,
    };

    dispatch({
      type: ACTIONS.ADD_BALL,
      payload: {
        id,
        x,
        y,
        radius: BALL_SIZE,
        force,
      },
    });
  };

  useEffect(() => {
    if (gameStatus === GameStatus.RUNNING) {
      spawnBall();
    }
  }, [gameStatus]);

  return (
    <Container x={x} y={y} rotation={rotation}>
      <Cannon toFire={gameStatus === GameStatus.RUNNING} />
      <CircleGraphics
        id={'center'}
        x={0}
        y={0}
        radius={10}
        fill={0xff0000}
        withBody={false}
      />
    </Container>
  );
};

export default Start;
