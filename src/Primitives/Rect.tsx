import { PixiComponent, useApp } from "@inlet/react-pixi";
import { Graphics as PixiGraphics } from "pixi.js";
import { gsap } from "gsap";
import { nanoid } from "nanoid";

const animations = {};

const addToAnimations = (g, oldProps, props, renderFn) => {
  const id = nanoid();

  animations[id] = {
    toProps: oldProps,
    isFinished: false
  };

  const tickerFn = () => {
    renderFn(g, animations[id].toProps);
  };

  gsap.ticker.add(tickerFn);

  gsap.to(animations[id].toProps, { duration: 1, ...props }).then(() => {
    gsap.ticker.remove(tickerFn);
  });
};

const maybeSpring = (v) => v?.get?.() || v;

const compare = (keys: string[], prev: object, next: object) =>
  keys.some((key) => maybeSpring(prev[key]) !== maybeSpring(next[key]));

const renderFn = (g, props) => {
  const { stroke, strokeWidth, fill, x, y, width, height, radius } = props;
  g.clear();

  if (stroke !== undefined) {
    g.lineStyle(strokeWidth, stroke);
  } else {
    g.lineStyle(0);
  }

  if (fill !== undefined) {
    g.beginFill(fill);
  } else {
    g.beginFill("black");
  }

  g.drawRoundedRect(
    maybeSpring(x),
    maybeSpring(y),
    maybeSpring(width),
    maybeSpring(height),
    radius
  );
  g.endFill();
};

const PixiRect = PixiComponent("Rect", {
  create(props) {
    const g = new PixiGraphics();
    g.interactive = true;

    return g;
  },
  applyProps(g, oldProps, newProps) {
    const { onClick: _onClick } = oldProps;
    const { onClick } = newProps;

    if (_onClick !== onClick) {
      if (g._onClick) {
        g.removeListener("pointerdown", g._onClick);
      }

      g.addListener("pointerdown", onClick);
      g._onClick = onClick;
    }

    // if (newProps.coordsKey === "0-0") {
    //   console.log(
    //     compare(["x"], this, newProps),
    //     maybeSpring(this.x),
    //     maybeSpring(newProps.x)
    //   );
    //   console.log(g._props);
    // }

    if (
      compare(
        ["stroke", "strokeWidth", "fill", "radius"],
        oldProps,
        newProps
      ) ||
      compare(["x", "y", "width", "height"], oldProps, newProps)
    ) {
      if (newProps.coordsKey === "0-0") {
        console.log("after compare");
      }

      addToAnimations(g, oldProps, newProps, renderFn);
    }
  }
});

export default PixiRect;
