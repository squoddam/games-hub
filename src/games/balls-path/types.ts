export type UseMatterProps = {
  id: string;
  body: Matter.Body;
  onCollision?: (ids: { idA: string; idB: string }, pair: Matter.IPair) => void;
};

export type WaypointBase = {
  id: string;
  x: number;
  y: number;
  rotation?: number;
};
