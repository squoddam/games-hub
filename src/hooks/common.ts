import { useCallback, useEffect, useRef, useState } from 'react';

export const useWindowResize = (cb?: () => void) => {
  useEffect(() => {
    const handleWindowResize = () => {
      cb?.();
    };

    handleWindowResize();

    window.addEventListener('resize', handleWindowResize);

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [cb]);
};

export const useDidUpdate = (callback: Function, deps: any[]) => {
  const [isInitial, setIsInitial] = useState(true);

  useEffect(() => {
    if (!isInitial) {
      callback();
    }

    setIsInitial(false);
  }, deps);
};

export const useDebounce = (cb: Function, delay: number = 300) => {
  const timeout = useRef<number>();

  const debounced = useCallback(
    (...args: any[]) => {
      clearTimeout(timeout.current);

      timeout.current = window.setTimeout(() => {
        cb(...args);
      }, delay);
    },
    [cb, delay]
  );

  return debounced;
};
