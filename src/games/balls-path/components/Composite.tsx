import Matter from 'matter-js';
import React, { useEffect, useRef } from 'react';

type CompositeProps = {
  children: React.ReactNode | React.ReactNode[] | null;
  x: number;
  y: number;
  rotation: number;
};

const Composite = ({ children, x, y, rotation = 0 }: CompositeProps) => {
  const compositeRef = useRef<Matter.Composite>();
  const childrenRef = useRef<Record<string, Matter.Body>>({});

  useEffect(() => {
    if (compositeRef.current === undefined) {
      compositeRef.current = Matter.Composite.create();
    }

    const bodies: Matter.Body[] = Object.values(childrenRef.current);

    if (bodies.length > 0) {
      Matter.Composite.add(compositeRef.current, bodies);
    }

    return () => {
      if (compositeRef.current) {
        /* TODO: Argument of type 'Body[]' is not assignable to parameter of type 'Composite | Body | Constraint'.
          Maybe PR to matter-js types?
        */
        // @ts-ignore
        Matter.Composite.remove(compositeRef.current, bodies);
      }
    };
  }, [children]);

  useEffect(() => {
    if (compositeRef.current) {
      Matter.Composite.translate(compositeRef.current, { x, y });
    }
  }, [x, y]);

  useEffect(() => {
    if (compositeRef.current) {
      Matter.Composite.rotate(compositeRef.current, rotation, { x, y }, true);
    }
  }, [x, y, rotation]);

  return React.Children.map<React.ReactNode, React.ReactNode>(
    children,
    (child) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child, {
          ref: (ref) => {
            if (ref !== null) {
              const body = ref.body || ref;
              if (body) {
                childrenRef.current[body.id] = body;
              }
            }
          },
        });
      }

      return null;
    }
  );
};

export default Composite;
