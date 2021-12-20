import anime from 'animejs';
import { useEffect, useState } from 'react';

export const useAnime = (
  animeConfig: anime.AnimeParams
): anime.AnimeInstance => {
  const [config, setConfig] = useState<anime.AnimeInstance>(anime(animeConfig));

  useEffect(() => {
    setConfig(anime(animeConfig));
  }, [animeConfig]);

  return config;
};
