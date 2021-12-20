export type UseMatterProps = {
  id: string;
  getBody: () => Matter.Body;
  onUpdate: (body: Matter.Body) => void;
  onClick?: () => void;
  onCollision?: (ids: { idA: string; idB: string }, pair: Matter.IPair) => void;
};

export type WaypointBase = {
  id: string;
  x: number;
  y: number;
  rotation?: number;
};
