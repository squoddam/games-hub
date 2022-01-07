import React, { Reducer, useReducer } from 'react';
import { ObstacleType, WaypointBase } from './types';

type BallInfo = {
  id: string;
  x: number;
  y: number;
  radius: number;
  force?: Matter.Vector;
};

type Store = {
  mousePos: Matter.Vector;
  waypoints: {
    start: WaypointBase | null;
    finish: WaypointBase | null;
  };
  balls: BallInfo[];
  obstacles: ObstacleType[];
  selectedObstacleId: string | null;
};

type StoreAction = {
  type: string;
  payload: any;
};

type StoreReducer = Reducer<Store, StoreAction>;

const initialStore: Store = {
  mousePos: { x: 0, y: 0 },
  waypoints: {
    start: null,
    finish: null,
  },
  balls: [],
  obstacles: [],
  selectedObstacleId: null,
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
  SET_WAYPOINTS: 'SET_WAYPOINTS',
  ADD_BALL: 'ADD_BALL',
  REMOVE_BALL: 'REMOVE_BALL',

  SET_SELECTED_OBSTACLE: 'SET_SELECTED_OBSTACLE',
  SET_OBSTACLE_ROTATION: 'SET_OBSTACLE_ROTATION',
  SET_OBSTACLE_POSITION: 'SET_OBSTACLE_POSITION',
  ADD_OBSTACLE: 'ADD_OBSTACLE',
  REMOVE_OBSTACLE: 'REMOVE_OBSTACLE',

  SET_MOUSE_POSITION: 'SET_MOUSE_POSITION',
};

const actionHandlers: Record<string, StoreReducer> = {
  [ACTIONS.SET_MOUSE_POSITION]: (store, { payload: { mousePos } }) => ({
    ...store,
    mousePos,
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
  [ACTIONS.SET_SELECTED_OBSTACLE]: (
    store,
    { payload: { selectedObstacleId } }
  ) => ({
    ...store,
    selectedObstacleId,
  }),
  [ACTIONS.SET_OBSTACLE_ROTATION]: (store, { payload: { id, rotation } }) => ({
    ...store,
    obstacles: store.obstacles.map((obstacle) =>
      obstacle.id === id ? { ...obstacle, rotation } : obstacle
    ),
  }),
  [ACTIONS.SET_OBSTACLE_POSITION]: (store, { payload: { id, x, y } }) => ({
    ...store,
    obstacles: store.obstacles.map((obstacle) =>
      obstacle.id === id ? { ...obstacle, x, y } : obstacle
    ),
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
