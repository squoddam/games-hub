import { useEffect, useState } from 'react';
import { useWindowResize } from '@/hooks';
import Game from './Game';

const Main = () => {
  const [sideSize, setSideSize] = useState(0);

  useEffect(() => {
    setSideSize(Math.min(window.innerWidth, window.innerHeight) - 16);
  }, []);

  useWindowResize(() => {
    setSideSize(Math.min(window.innerWidth, window.innerHeight) - 16);
  });

  return <Game sideSize={sideSize} />;
};

export default Main;
