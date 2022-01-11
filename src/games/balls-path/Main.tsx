import { useState } from 'react';
import Link from 'next/link';

import { useWindowResize } from '@/hooks';
import styles from '@/styles.module.css';

import Game from './Game';
import LEVELS from './levels.json';

enum Status {
  ready,
  selecting,
  playing,
  finish,
}

const StartMenu = ({ onSelectingClick }: { onSelectingClick: () => void }) => (
  <div className={styles.menu}>
    <h1 className={styles.title}>The game where you help balls get home</h1>
    <div className={styles.menuList}>
      <div className={styles.menuItem} onClick={onSelectingClick}>
        Select level
      </div>
      <Link href="/">
        <a className={styles.menuItem}>Back to games hub</a>
      </Link>
    </div>
  </div>
);

const LevelsMenu = ({
  onLevelClick,
}: {
  onLevelClick: (i: number) => void;
}) => (
  <div className={styles.menu}>
    <h1 className={styles.title}>Select level</h1>
    <div className="flex w-full justify-center space-x-5">
      {LEVELS.map(({ id }, i) => (
        <div
          key={id}
          className="border-4 border-black border-solid cursor-pointer font-bold p-10 rounded-2xl text-3xl"
          onClick={() => onLevelClick(i)}
        >
          {i + 1}
        </div>
      ))}
    </div>
  </div>
);

const FinishMenu = ({
  onNextLevelClick,
  nextLevelText,
}: {
  onNextLevelClick: () => void;
  nextLevelText: string;
}) => (
  <div className={styles.menu}>
    <h1 className={styles.title}>Nice one!</h1>
    <div className={styles.menuList}>
      <div className={styles.menuItem} onClick={onNextLevelClick}>
        {nextLevelText}
      </div>
      <Link href="/">
        <a className={styles.menuItem}>Back to games hub</a>
      </Link>
    </div>
  </div>
);

const Main = () => {
  const [sideSize, setSideSize] = useState(0);
  const [status, setStatus] = useState(Status.ready);
  const [currentLevel, setCurrentLevel] = useState(0);

  useWindowResize(() => {
    setSideSize(Math.min(window.innerWidth, window.innerHeight) - 16);
  });

  return (
    <div className={styles.mainContainer}>
      {status === Status.ready && (
        <StartMenu onSelectingClick={() => setStatus(Status.selecting)} />
      )}

      {status === Status.selecting && (
        <LevelsMenu
          onLevelClick={(i) => {
            setCurrentLevel(i);
            setStatus(Status.playing);
          }}
        />
      )}

      {status === Status.playing && (
        <Game
          sideSize={sideSize}
          currentLevel={currentLevel}
          onFinish={() => setStatus(Status.finish)}
        />
      )}

      {status === Status.finish && (
        <FinishMenu
          onNextLevelClick={() => {
            if (currentLevel < LEVELS.length - 1) {
              setCurrentLevel((currState) => currState + 1);
              setStatus(Status.playing);
            } else {
              setStatus(Status.selecting);
            }
          }}
          nextLevelText={
            currentLevel < LEVELS.length - 1 ? 'Next level' : 'Select level'
          }
        />
      )}
    </div>
  );
};

export default Main;
