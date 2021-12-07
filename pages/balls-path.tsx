import dynamic from 'next/dynamic';

const BallsPathGame = dynamic(() => import('@balls/index'), {
  ssr: false,
});

export default function BallsPath() {
  return <BallsPathGame />;
}
