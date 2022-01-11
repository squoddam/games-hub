import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

import { useWindowResize } from '@/hooks';
import { randMinMax } from '@/utils';
import styles from '@/styles.module.css';

import Board from './Board';


enum Status {
  ready,
  playing,
  win,
  lose,
}

const messagesWin = [
  'You did it!',
  'Wow, impressive!',
  "Couldn't do better myself!",
  'Good job!',
  'You played it before, right?',
];

const messagesLose = [
  'You lost!',
  'You can do better!',
  'One more time?',
  'Well, you tried.',
  "Don't be upset, it's just a game",
];

const Menu = ({
  status,
  setStatus,
}: {
  status: Status;
  setStatus: (nextStatus: Status) => void;
}) => {
  const title = useMemo(() => {
    if (status === Status.ready) {
      return "I hope you don't mined";
    }

    if (status === Status.win) {
      return messagesWin[randMinMax(0, messagesWin.length)];
    }

    return messagesLose[randMinMax(0, messagesLose.length)];
  }, [status]);

  if (status === Status.playing) {
    return null;
  }

  return (
    <div className={styles.menu}>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.menuList}>
        <div
          className={styles.menuItem}
          onClick={() => setStatus(Status.playing)}
        >
          Play {status !== Status.ready ? 'again' : 'now'}
        </div>
        <Link href="/">
          <a className={styles.menuItem}>Back to games hub</a>
        </Link>
      </div>
    </div>
  );
};

const Main = () => {
  const [sideSize, setSideSize] = useState(0);

  useEffect(() => {
    setSideSize(Math.min(window.innerWidth, window.innerHeight) - 16);
  }, []);

  useWindowResize(() => {
    setSideSize(Math.min(window.innerWidth, window.innerHeight) - 16);
  });

  const [status, setStatus] = useState<Status>(Status.ready);

  const boardRef = useRef<{ reset: () => void } | null>(null);

  const handleMenuClick = (nextStatus: Status) => {
    setStatus(nextStatus);

    if (
      status !== Status.ready &&
      nextStatus === Status.playing &&
      boardRef.current
    ) {
      boardRef.current.reset();
    }
  };

  return (
    <div className={styles.mainContainer}>
      <Board
        ref={boardRef}
        sideSize={sideSize}
        onWin={() => setStatus(Status.win)}
        onLose={() => setStatus(Status.lose)}
      />
      <Menu status={status} setStatus={handleMenuClick} />
    </div>
  );
};

export default Main;
