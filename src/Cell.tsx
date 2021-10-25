import { memo, useMemo, useState } from "react";
import { useSpring, config } from "react-spring";
import { Vector2 } from "./types";

import Rect from "./Primitives/Rect";
import { getKey } from "./utils";

const Cell = ({
  coords,
  cellSize,
  cellBorderPadding,
  isRevealed,
  isMine,
  nearbyMinesCount,
  dispatch
}: {
  coords: Vector2;
  cellSize: number;
  cellBorderPadding: number;
  isRevealed: boolean;
  isMine: boolean;
  nearbyMinesCount?: number;

  dispatch: (actionType: string, payload: { r: number; c: number }) => void;
}) => {
  // console.log("cell");
  const [isRevealFinished, setIsRevealFinished] = useState(false);

  const padding = useMemo(() => cellBorderPadding + (isRevealed ? 5 : 0), [
    cellBorderPadding,
    isRevealed
  ]);
  const [c, r] = coords;
  const left = c * cellSize;
  const top = r * cellSize;

  const to = {
    x: !isRevealed ? left + padding : left + cellSize / 2,
    y: !isRevealed ? top + padding : top + cellSize / 2,
    width: !isRevealed ? cellSize - padding * 2 : 0,
    height: !isRevealed ? cellSize - padding * 2 : 0
  };

  const dimensions = useSpring({
    to,
    onRest: () => setIsRevealFinished(true)
    // config: {
    //   duration: 1000
    // }
  });

  const countSize = useSpring({
    fontSize: !isRevealed ? 0 : 12
  });

  const handleClick = () => {
    console.log({ c, r });
    dispatch("CELL_CLICK", { c, r });
  };

  // if (isRevealFinished) {
  //   if (nearbyMinesCount) {
  //     return (
  //       <text x={x} y={y + cellSize / 2}>
  //         {nearbyMinesCount}
  //       </text>
  //     );
  //   }

  //   if (isMine) {
  //     return (
  //       <circle
  //         cx={x + cellSize / 2}
  //         cy={y + cellSize / 2}
  //         r={cellSize / 2 - padding}
  //         fill="red"
  //       />
  //     );
  //   }

  //   return null;

  //   // return (
  //   //   <rect
  //   //     x={x}
  //   //     y={y}
  //   //     stroke="blue"
  //   //     fill="transparent"
  //   //     width={cellSize - padding * 2}
  //   //     height={cellSize - padding * 2}
  //   //     onClick={() => {
  //   //       console.log({
  //   //         nearbyMinesCount
  //   //       });
  //   //     }}
  //   //   />
  //   // );
  // }

  return (
    <Rect coordsKey={getKey(coords)} {...to} radius={4} onClick={handleClick} />
  );
  // return (
  //   <Group>
  //     <animated.Rect
  //       {...dimensions}
  //       cornerRadius={4}
  //       fill="black"
  //       onClick={handleClick}
  //     />
  //     {/* {isRevealed && nearbyMinesCount && (
  //       <Text
  //         x={left + cellSize / 2}
  //         y={top + cellSize / 2}
  //         // verticalAlign="middle"
  //         // text={String(nearbyMinesCount)}
  //         // {...countSize}
  //       />
  //     )} */}
  //     {isRevealed && isMine && (
  //       <Circle
  //         x={left + cellSize / 2}
  //         y={top + cellSize / 2}
  //         radius={cellSize / 2 - padding}
  //         fill="red"
  //       />
  //     )}
  //   </Group>
  // );
};

export default memo(Cell);
