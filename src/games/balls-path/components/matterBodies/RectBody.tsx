import { Bodies, Body } from 'matter-js';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { useMatter } from '@balls/MatterCtx';
import { UseMatterProps } from '@balls/types';

export type RectBodyProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  options?: Matter.IChamferableBodyDefinition | undefined;
  onCollision?: UseMatterProps['onCollision'];
};

const RectBody = forwardRef(
  ({ id, x, y, width, height, options, onCollision }: RectBodyProps, ref) => {
    const body = useMemo<Body>(
      () =>
        Bodies.rectangle(x + width / 2, y + height / 2, width, height, options),
      [x, y, width, height, options]
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

RectBody.displayName = 'RectBody';

export default RectBody;
