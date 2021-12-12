import React, { Reducer, useReducer } from 'react';

type BallInfo = {
  id: string;
  x: number;
  y: number;
  radius: number;
};

type ObstacleInfo = {
  id: string;
  x: number;
  y: number;
  rotation: number;
};

type Store = {
  balls: BallInfo[];
  obstacles: ObstacleInfo[];
};

type StoreAction = {
  type: string;
  payload: any;
};

type StoreReducer = Reducer<Store, StoreAction>;

const initialStore: Store = {
  balls: [],
  obstacles: [],
};

type StoreCtxType = {
  store: Store;
  dispatch: React.Dispatch<StoreAction>;
};

export const storeCtx = React.createContext<StoreCtxType>({
  store: initialStore,
  dispatch: () => {},
});

export const ACTIONS = {
  ADD_BALL: 'ADD_BALL',
  REMOVE_BALL: 'REMOVE_BALL',
  ADD_OBSTACLE: 'ADD_OBSTACLE',
  REMOVE_OBSTACLE: 'REMOVE_OBSTACLE',
};

const actionHandlers: Record<string, StoreReducer> = {
  [ACTIONS.ADD_BALL]: (store, { payload }) => {
    return {
      ...store,
      balls: [...store.balls, payload],
    };
  },
  [ACTIONS.REMOVE_BALL]: (store, { payload: { id } }) => {
    return {
      ...store,
      balls: store.balls.filter((ball) => ball.id !== id),
    };
  },
  [ACTIONS.ADD_OBSTACLE]: (store, { payload }) => {
    return {
      ...store,
      obstacles: [...store.obstacles, payload],
    };
  },
  [ACTIONS.REMOVE_OBSTACLE]: (store, { payload: { id } }) => {
    return {
      ...store,
      obstacles: store.obstacles.filter((obstacle) => obstacle.id !== id),
    };
  },
};

const storeReducer: StoreReducer = (store: Store, action: any) => {
  const { type } = action;

  if (actionHandlers[type]) {
    return actionHandlers[type](store, action);
  }

  return store;
};

export const StoreProvider: React.FC = ({ children }) => {
  const [store, dispatch] = useReducer<StoreReducer>(
    storeReducer,
    initialStore
  );
  return (
    <storeCtx.Provider value={{ store, dispatch }}>
      {children}
    </storeCtx.Provider>
  );
};
