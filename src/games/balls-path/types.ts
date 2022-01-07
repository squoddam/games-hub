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

export type ObstacleType = {
  id: string;
  x: number;
  y: number;
  rotation: number;
};
