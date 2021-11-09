import { Vector2 } from "@/types";

export type BoardCell = {
  coords: Vector2;
  isMine: boolean;
  nearbyMinesCount?: number;
  isRevealed: boolean;
};
