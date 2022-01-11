export type UseMatterProps = {
  id?: string;
  body: Matter.Body;
  onCollision?: (pair: Matter.IPair) => void;
};

export type WaypointBase = {
  id: string;
  x: number;
  y: number;
  rotation?: number;
};

export type StartWaypoint = WaypointBase & { forceToApply?: number };

export type LevelType = {
  id: string;
  start: StartWaypoint;
  finish: WaypointBase;
};

export type ObstacleType = {
  id: string;
  x: number;
  y: number;
  rotation: number;
};
