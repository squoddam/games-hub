import Link from 'next/link';

export default function App() {
  return (
    <div className="flex flex-col w-screen h-screen space-y-16 pt-8">
      <h1 className="text-center text-6xl font-bold">Games Hub</h1>
      <Link href="/minesweeper">
        <a className="text-center text-3xl">Mined yourself!</a>
      </Link>
    </div>
  );
}
