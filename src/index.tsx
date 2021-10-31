import { render } from 'react-dom';

import * as PIXI from 'pixi.js';

import App from './App';

PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
PIXI.settings.ROUND_PIXELS = true;

const rootElement = document.getElementById('root');
render(<App />, rootElement);
