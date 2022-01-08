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

export type LevelType = {
  start: WaypointBase;
  finish: WaypointBase;
}

export type ObstacleType = {
  id: string;
  x: number;
  y: number;
  rotation: number;
};
