import { render } from "react-dom";

import { gsap } from "gsap";
import { PixiPlugin } from "gsap/PixiPlugin";

import App from "./App";

gsap.registerPlugin(PixiPlugin);

// console.log("index");

const rootElement = document.getElementById("root");
render(<App />, rootElement);
