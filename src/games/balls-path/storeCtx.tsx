import React, { Reducer, useReducer } from 'react';
import { WaypointBase } from './types';

type BallInfo = {
  id: string;
  x: number;
  y: number;
  radius: number;
  force?: Matter.Vector;
};

type ObstacleInfo = {
  id: string;
  x: number;
  y: number;
  rotation: number;
};

export enum GameStatus {
  RUNNING = 'running',
  PAUSED = 'paused',
  FINISHED = 'finished',
}

type Store = {
  mousePos: Matter.Vector;
  gameStatus: GameStatus;
  waypoints: {
    start: WaypointBase | null;
    end: WaypointBase | null;
  };
  balls: BallInfo[];
  obstacles: ObstacleInfo[];
};

type StoreAction = {
  type: string;
  payload: any;
};

type StoreReducer = Reducer<Store, StoreAction>;

const initialStore: Store = {
  mousePos: { x: 0, y: 0 },
  gameStatus: GameStatus.PAUSED,
  waypoints: {
    start: null,
    end: null,
  },
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
  SET_GAME_STATUS: 'SET_GAME_STATUS',
  SET_WAYPOINTS: 'SET_WAYPOINTS',
  ADD_BALL: 'ADD_BALL',
  REMOVE_BALL: 'REMOVE_BALL',
  ADD_OBSTACLE: 'ADD_OBSTACLE',
  REMOVE_OBSTACLE: 'REMOVE_OBSTACLE',

  SET_MOUSE_POSITION: 'SET_MOUSE_POSITION',
};

const actionHandlers: Record<string, StoreReducer> = {
  [ACTIONS.SET_MOUSE_POSITION]: (store, { payload: { mousePos } }) => ({
    ...store,
    mousePos,
  }),
  [ACTIONS.SET_GAME_STATUS]: (store, { payload: { status } }) => ({
    ...store,
    gameStatus: status,
  }),
  [ACTIONS.SET_WAYPOINTS]: (store, { payload: { waypoints } }) => ({
    ...store,
    waypoints,
  }),
  [ACTIONS.ADD_BALL]: (store, { payload }) => ({
    ...store,
    balls: [...store.balls, payload],
  }),
  [ACTIONS.REMOVE_BALL]: (store, { payload: { id } }) => ({
    ...store,
    balls: store.balls.filter((ball) => ball.id !== id),
  }),
  [ACTIONS.ADD_OBSTACLE]: (store, { payload }) => ({
    ...store,
    obstacles: [...store.obstacles, payload],
  }),
  [ACTIONS.REMOVE_OBSTACLE]: (store, { payload: { id } }) => ({
    ...store,
    obstacles: store.obstacles.filter((obstacle) => obstacle.id !== id),
  }),
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
