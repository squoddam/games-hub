import { Bodies, Body } from 'matter-js';
import { forwardRef, memo, useImperativeHandle, useMemo } from 'react';
import { useMatter } from '@balls/MatterCtx';
import { UseMatterProps } from '@balls/types';

export type CircleBodyProps = {
  id?: string;
  x: number;
  y: number;
  radius: number;
  options?: Matter.IChamferableBodyDefinition | undefined;
  onCollision?: UseMatterProps['onCollision'];
};

const CircleBody = forwardRef(
  ({ id, x, y, radius, options, onCollision }: CircleBodyProps, ref) => {
    const body = useMemo<Body>(
      () => Bodies.circle(x, y, radius, options),
      [x, y, radius, options]
    );

    useImperativeHandle(ref, () => body, [body]);

    const matterConfig = useMemo(
      () => ({
        id,
        body,
        onCollision,
      }),
      [body, onCollision, id]
    );

    useMatter(matterConfig);

    return null;
  }
);

CircleBody.displayName = 'CircleBody';

export default memo(CircleBody);
