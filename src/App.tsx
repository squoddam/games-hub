import Link from 'next/link';

export default function App() {
  return (
    <div className="App">
      <h1>Games</h1>
      <Link href="/minesweeper">Mined yourself!</Link>
    </div>
  );
}
