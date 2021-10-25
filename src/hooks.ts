import { useCallback, useEffect, useRef } from "react";

export const useWindowResize = (cb?: () => void) => {
  useEffect(() => {
    const handleWindowResize = () => {
      cb?.();
    };

    handleWindowResize();

    window.addEventListener("resize", handleWindowResize);

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, []);
};

export const useActions = (actions: Record<string, (payload: any) => void>) => {
  const actionsRef = useRef(actions);

  useEffect(() => {
    actionsRef.current = actions;
  }, [actions]);

  const dispatch = useCallback((actionType, payload) => {
    actionsRef.current[actionType]?.(payload);
  }, []);

  return dispatch;
};
