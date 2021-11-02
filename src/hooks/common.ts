import { useCallback, useEffect, useRef } from 'react';

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
