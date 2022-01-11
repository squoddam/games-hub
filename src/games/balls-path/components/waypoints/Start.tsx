import {
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { Container } from '@inlet/react-pixi';
import { nanoid } from 'nanoid';

import RectGraphics from '@/components/primitives/RectGraphics';
import CircleGraphics from '@/components/primitives/CircleGraphics';
import { ShapeRefType } from '@/components/primitives/Shape';

import { StartWaypoint } from '@balls/types';
import { BALL_SIZE } from '@balls/constants';
import { ACTIONS, storeCtx } from '@balls/storeCtx';
import { tween, Tweenable } from 'shifty';

const CANNON_MARGIN = 8;

const ANIM_DURATION = 1;

const Cannon = forwardRef((props, ref) => {
  const barrel2Ref = useRef<ShapeRefType | null>(null);
  const muzzleRef = useRef<ShapeRefType | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      fire: () => {
        tween({
          render: ({ t }: { t: number }) => {
            if (barrel2Ref.current) {
              const initialPosition = BALL_SIZE;
              const diffPosition = -CANNON_MARGIN * 2;

              barrel2Ref.current.draw({
                y: initialPosition + diffPosition * t,
              });
            }

            if (muzzleRef.current) {
              const initialPosition = BALL_SIZE * 2 + CANNON_MARGIN;
              const diffPosition = -CANNON_MARGIN * 3;

              muzzleRef.current.draw({
                y: initialPosition + diffPosition * t,
              });
            }
          },
          from: { t: 0 },
          to: { t: 1 },
          easing: 'linear',
          duration: 100 * ANIM_DURATION,
          delay: 50,
        }).then(({ tweenable }: { tweenable: Tweenable }) => {
          tweenable.tween({
            to: { t: 0 },
            easing: 'easeOutCirc',
            duration: 300 * ANIM_DURATION,
          });
        }, console.error);
      },
    }),
    []
  );

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
});

Cannon.displayName = 'Cannon';

const Start = ({ x, y, rotation = 0, forceToApply = 0.1 }: StartWaypoint) => {
  const { dispatch } = useContext(storeCtx);

  const cannonRef = useRef<{ fire: () => void } | null>(null);

  const spawnBall = useCallback(() => {
    const id = nanoid();

    const force = {
      x: Math.cos(rotation * Math.PI + Math.PI / 2) * forceToApply,
      y: Math.sin(rotation * Math.PI + Math.PI / 2) * forceToApply,
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

    if (cannonRef.current) {
      cannonRef.current.fire();
    }
  }, [dispatch, forceToApply, rotation, x, y]);

  useEffect(() => {
    const intervalId = setInterval(spawnBall, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [spawnBall]);

  return (
    <Container x={x} y={y} rotation={rotation * Math.PI}>
      <Cannon ref={cannonRef} />
    </Container>
  );
};

export default Start;
