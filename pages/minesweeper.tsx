import dynamic from 'next/dynamic';

const MinesweeperGame = dynamic(() => import('@minesweeper/index'), {
  ssr: false,
});

export default function Minesweeper() {
  return <MinesweeperGame />;
}
