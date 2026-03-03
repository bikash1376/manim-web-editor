export const EXAMPLES = [
  {
    name: "Sine Curve Unit Circle",
    code: `// Note: The "scene" object and all manim-web exports are available globally.
// However, when using manim-web in your own project, you must import and configure them.
// See the API reference for more info: https://maloyan.github.io/manim-web/api

const TAU = 2 * Math.PI;

// --- Axes ---
const xAxis = new Line({ start: [-6, 0, 0], end: [6, 0, 0] });
const yAxis = new Line({ start: [-4, -2, 0], end: [-4, 2, 0] });
scene.add(xAxis, yAxis);

// --- X labels ---
const xLabels = [
  new MathTex({ latex: '\\\\pi' }),
  new MathTex({ latex: '2\\\\pi' }),
  new MathTex({ latex: '3\\\\pi' }),
  new MathTex({ latex: '4\\\\pi' }),
];
for (let i = 0; i < xLabels.length; i++) {
  xLabels[i].nextTo([-1 + 2 * i, 0, 0], DOWN, 0.4);
  scene.add(xLabels[i]);
}

const originPoint = [-4, 0, 0];
const curveStart = [-3, 0, 0];

// --- Circle ---
const circle = new Circle({ radius: 1, center: originPoint, color: RED });
scene.add(circle);

// --- Dot orbiting the circle ---
let tOffset = 0;
const rate = 0.25;

const dot = new Dot({
  radius: 0.08,
  color: YELLOW,
  point: circle.pointAtAngle(0),
});

const goAroundCircle = (_mob, dt) => {
  tOffset += dt * rate;
  dot.moveTo(circle.pointAtAngle((tOffset % 1) * TAU));
};
dot.addUpdater(goAroundCircle);

// --- Line from origin to dot (always_redraw equivalent) ---
const originToCircleLine = new Line({
  start: originPoint,
  end: dot.getPoint(),
  color: BLUE,
});
originToCircleLine.addUpdater(() => {
  originToCircleLine.setStart(originPoint);
  originToCircleLine.setEnd(dot.getPoint());
});

// --- Line from dot to curve (always_redraw equivalent) ---
const dotToCurveLine = new Line({
  start: dot.getPoint(),
  end: dot.getPoint(),
  color: YELLOW_A,
  strokeWidth: 2,
});
dotToCurveLine.addUpdater(() => {
  const x = curveStart[0] + tOffset * 4;
  const y = dot.getPoint()[1];
  dotToCurveLine.setStart(dot.getPoint());
  dotToCurveLine.setEnd([x, y, 0]);
});

// --- Growing sine curve ---
const curve = new VGroup();
curve.add(new Line({ start: curveStart, end: curveStart, color: YELLOW_D }));
let lastEnd = [...curveStart];

curve.addUpdater(() => {
  const x = curveStart[0] + tOffset * 4;
  const y = dot.getPoint()[1];
  const newLine = new Line({
    start: lastEnd,
    end: [x, y, 0],
    color: YELLOW_D,
  });
  curve.add(newLine);
  lastEnd = [x, y, 0];
});

// Add in order: dot first so tOffset/position updates before lines read it
scene.add(dot, originToCircleLine, dotToCurveLine, curve);

await scene.wait(8.5);

dot.removeUpdater(goAroundCircle);
`
  },
  {
    name: "Moving Frame Box",
    code: `// Note: The "scene" object and all manim-web exports are available globally.
// However, when using manim-web in your own project, you must import and configure them.
// See the API reference for more info: https://maloyan.github.io/manim-web/api

const text = new MathTex({
  latex: ['\\\\frac{d}{dx}f(x)g(x)=', 'f(x)\\\\frac{d}{dx}g(x)', '+', 'g(x)\\\\frac{d}{dx}f(x)'],
});
await text.waitForRender();
await scene.play(new Write(text));
const framebox1 = new SurroundingRectangle(text.getPart(1), { buff: 0.1 });
const framebox2 = new SurroundingRectangle(text.getPart(3), { buff: 0.1 });
await scene.play(new Create(framebox1));
await scene.wait();
await scene.play(new ReplacementTransform(framebox1, framebox2));
await scene.wait();
`
  },
  {
    name: "Boolean Operations",
    code: `// Note: The "scene" object and all manim-web exports are available globally.
// However, when using manim-web in your own project, you must import and configure them.
// See the API reference for more info: https://maloyan.github.io/manim-web/api

const ellipse1 = new Ellipse({
  width: 4.0,
  height: 5.0,
  fillOpacity: 0.5,
  color: BLUE,
  strokeWidth: 2,
}).moveTo(LEFT);

const ellipse2 = ellipse1.copy().setColor(RED).moveTo(RIGHT);
// Large italic underlined title matching Python Manim reference
const bool_ops_text = new Text({
  text: 'Boolean Operation',
  fontFamily: 'serif',
  fontSize: 48,
}).nextTo(ellipse1, UP);
const ellipse_group = new Group(bool_ops_text, ellipse1, ellipse2).moveTo(scaleVec(3, LEFT));
// Create underline AFTER group is positioned so it uses the text's final position
const underline = new Underline(bool_ops_text, { color: WHITE, strokeWidth: 2, buff: -0.25 });
ellipse_group.add(underline);
await scene.play(new FadeIn(ellipse_group));

// Layout matching Python Manim reference:
//        Intersection
//  Difference    Union
//        Exclusion
// Intersection, Union, Exclusion are vertically aligned on the right.
// Difference is offset to the left at the same row as Union.
// Positions and scales matching Python Manim reference exactly:
// Intersection: scale(0.25), move_to(RIGHT*5 + UP*2.5)
// Union: scale(0.3), next_to(i, DOWN, buff=text.height*3)
// Exclusion: scale(0.3), next_to(u, DOWN, buff=text.height*3.5)
// Difference: scale(0.3), next_to(u, LEFT, buff=text.height*3.5)
const rightX = 5;

const i = new Intersection(ellipse1, ellipse2, { color: GREEN, fillOpacity: 0.5 });
i.generateTarget();
i.targetCopy.scale(0.25).setStrokeWidth(1).moveTo([rightX, 2.5, 0]);
await scene.play(new MoveToTarget(i));
const intersection_text = new Text({ text: 'Intersection', fontSize: 23 }).nextTo(i, UP);
await scene.play(new FadeIn(intersection_text));

const u = new Union(ellipse1, ellipse2, { color: ORANGE, fillOpacity: 0.5 });
const union_text = new Text({ text: 'Union', fontSize: 23 });
u.generateTarget();
u.targetCopy
  .scale(0.3)
  .setStrokeWidth(1.2)
  .nextTo(i, DOWN, union_text.getHeight() * 3);
await scene.play(new MoveToTarget(u));
union_text.nextTo(u, UP);
await scene.play(new FadeIn(union_text));

const e = new Exclusion(ellipse1, ellipse2, { color: YELLOW, fillOpacity: 0.5 });
const exclusion_text = new Text({ text: 'Exclusion', fontSize: 23 });
e.generateTarget();
e.targetCopy
  .scale(0.3)
  .setStrokeWidth(1.2)
  .nextTo(u, DOWN, exclusion_text.getHeight() * 3.5);
await scene.play(new MoveToTarget(e));
exclusion_text.nextTo(e, UP);
await scene.play(new FadeIn(exclusion_text));

const d = new Difference(ellipse1, ellipse2, { color: PINK, fillOpacity: 0.5 });
const difference_text = new Text({ text: 'Difference', fontSize: 23 });
d.generateTarget();
d.targetCopy
  .scale(0.3)
  .setStrokeWidth(1.2)
  .nextTo(u, LEFT, difference_text.getHeight() * 3.5);
await scene.play(new MoveToTarget(d));
difference_text.nextTo(d, UP);
await scene.play(new FadeIn(difference_text));`
  },
  {
    name: "Mathtex Svg",
    code: `// Note: The "scene" object and all manim-web exports are available globally.
// However, when using manim-web in your own project, you must import and configure them.
// See the API reference for more info: https://maloyan.github.io/manim-web/api

// Pre-create all equations
const equation1 = new MathTexSVG({
  latex: '\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}',
  color: WHITE,
  fontSize: 2,
});
const equation2 = new MathTexSVG({
  latex: 'e^{i\\pi} + 1 = 0',
  color: YELLOW,
  fontSize: 2.5,
});
const multiPart = new MathTexSVG({
  latex: ['E', '=', 'mc^2'],
  color: WHITE,
  fontSize: 3,
});
const equation3 = new MathTexSVG({
  latex: '\\sum_{k=1}^{n} k = \\frac{n(n+1)}{2}',
  color: GREEN,
  fontSize: 2,
});
const matrix = new MathTexSVG({
  latex: 'A = \\begin{pmatrix} a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix}',
  color: WHITE,
  fontSize: 2,
});

// Render all SVGs in parallel
await Promise.all([
  equation1.waitForRender(),
  equation2.waitForRender(),
  multiPart.waitForRender(),
  equation3.waitForRender(),
  matrix.waitForRender(),
]);

// 1. Create animation - stroke-draw reveal (the main feature)
await scene.play(new Create(equation1, { duration: 3 }));
await scene.wait(1);
await scene.play(new FadeOut(equation1));

// 2. DrawBorderThenFill animation
await scene.play(new DrawBorderThenFill(equation2, { duration: 2 }));
await scene.wait(1);
await scene.play(new FadeOut(equation2));

// 3. Multi-part with per-part coloring
multiPart.getPart(0).setColor(RED);
multiPart.getPart(1).setColor(WHITE);
multiPart.getPart(2).setColor(BLUE);

await scene.play(new FadeIn(multiPart));
await scene.wait(2);
await scene.play(new FadeOut(multiPart));

// 4. Another Create with a summation
await scene.play(new Create(equation3, { duration: 2 }));
await scene.wait(2);
await scene.play(new FadeOut(equation3));

// 5. 2x2 matrix with subscript indices
await scene.play(new Create(matrix, { duration: 2 }));
await scene.wait(2);`
  },
  {
    name: "Point Moving on Shapes",
    code: `// Note: The "scene" object and all manim-web exports are available globally.
// However, when using manim-web in your own project, you must import and configure them.
// See the API reference for more info: https://maloyan.github.io/manim-web/api

const circle = new Circle({ radius: 1, color: BLUE });
const dot = new Dot();
const dot2 = dot.copy().shift(RIGHT);
scene.add(dot);

const line = new Line({ start: [3, 0, 0], end: [5, 0, 0] });
scene.add(line);

await scene.play(new GrowFromCenter(circle));
await scene.play(new Transform(dot, dot2));
await scene.play(new MoveAlongPath(dot, { path: circle, duration: 2, rateFunc: linear }));
await scene.play(new Rotating(dot, { aboutPoint: [2, 0, 0], duration: 1.5 }));
await scene.wait();`
  },
  {
    name: "Moving Dots",
    code: `// Note: The "scene" object and all manim-web exports are available globally.
// However, when using manim-web in your own project, you must import and configure them.
// See the API reference for more info: https://maloyan.github.io/manim-web/api

const d1 = new Dot({ color: BLUE });
const d2 = new Dot({ color: GREEN });
new VGroup(d1, d2).arrange(RIGHT, 1);
const l1 = new Line({ start: d1.getCenter(), end: d2.getCenter() }).setColor(RED);
const x = new ValueTracker(0);
const y = new ValueTracker(0);
d1.addUpdater((z) => z.setX(x.getValue()));
d2.addUpdater((z) => z.setY(y.getValue()));
l1.addUpdater((z) => z.become(new Line({ start: d1.getCenter(), end: d2.getCenter() })));
scene.add(d1, d2, l1);
await scene.play(x.animateTo(5));
await scene.play(y.animateTo(4));
await scene.wait();`
  },
  {
    name: "Easing Functions Showcase",
    code: `// Note: The "scene" object and all manim-web exports are available globally.
// However, when using manim-web in your own project, you must import and configure them.
// See the API reference for more info: https://maloyan.github.io/manim-web/api

// Rate functions to compare, each with a label and color
const rateFunctions = [
  { name: 'smooth', rateFunc: smooth, color: BLUE },
  { name: 'easeInOutSine', rateFunc: easeInOutSine, color: RED },
  { name: 'easeInOutBack', rateFunc: easeInOutBack, color: GREEN },
  { name: 'easeOutElastic', rateFunc: easeOutElastic, color: YELLOW },
  { name: 'easeOutBounce', rateFunc: easeOutBounce, color: PURPLE },
  { name: 'easeInOutCirc', rateFunc: easeInOutCirc, color: ORANGE },
  { name: 'smoothstep', rateFunc: smoothstep, color: '#ff69b4' },
  { name: 'easeInOutExpo', rateFunc: easeInOutExpo, color: '#00ced1' },
];

const ROW_COUNT = rateFunctions.length;
const TOP_Y = 2.5;
const ROW_SPACING = 0.65;
const START_X = -2.2;
const SHIFT_DISTANCE = 5.0;

const dots = [];
const shiftDirection = scaleVec(SHIFT_DISTANCE, RIGHT);

for (let i = 0; i < ROW_COUNT; i++) {
  const y = TOP_Y - i * ROW_SPACING;
  const { name, color } = rateFunctions[i];

  // Label on the left
  const label = new Text({
    text: name,
    fontSize: 18,
    color: WHITE,
  });
  label.moveTo([START_X - 2.3, y, 0]);

  // Track line (faint guide)
  const trackLine = new Line({
    start: [START_X, y, 0],
    end: [START_X + SHIFT_DISTANCE, y, 0],
    color: '#333333',
    strokeWidth: 1,
  });

  // Dot at the start position
  const dot = new Dot({
    point: [START_X, y, 0],
    radius: 0.1,
    color,
  });

  scene.add(label, trackLine, dot);
  dots.push(dot);
}

// Build simultaneous shift animations with different rate functions
const animations = dots.map(
  (dot, i) =>
    new Shift(dot, {
      direction: shiftDirection,
      duration: 3,
      rateFunc: rateFunctions[i].rateFunc,
    }),
);

await scene.play(new AnimationGroup(animations));`
  },
  {
    name: "Following Graph Camera",
    code: `// Note: The "scene" object and all manim-web exports are available globally.
// However, when using manim-web in your own project, you must import and configure them.
// See the API reference for more info: https://maloyan.github.io/manim-web/api

// Save camera frame state
scene.camera.frame.saveState();

// Create the axes and the curve
const ax = new Axes({ xRange: [-1, 10], yRange: [-1, 10] });
const graph = ax.plot((x) => Math.sin(x), { color: BLUE, xRange: [0, 3 * Math.PI] });

// Create dots based on the graph
const movingDot = new Dot({ point: ax.i2gp(graph.tMin, graph), color: ORANGE });
const dot1 = new Dot({ point: ax.i2gp(graph.tMin, graph) });
const dot2 = new Dot({ point: ax.i2gp(graph.tMax, graph) });

scene.add(ax, graph, dot1, dot2, movingDot);

// Zoom camera to 0.5x and center on moving dot
scene.camera.frame.generateTarget();
scene.camera.frame.targetCopy.scale(0.5);
scene.camera.frame.targetCopy.moveTo(movingDot.getCenter());
await scene.play(new MoveToTarget(scene.camera.frame));

// Add updater so camera follows the moving dot
const updateCurve = (mob) => {
  mob.moveTo(movingDot.getCenter());
};
scene.camera.frame.addUpdater(updateCurve);

// Animate dot moving along the graph path
await scene.play(new MoveAlongPath(movingDot, { path: graph, rateFunc: linear }));

// Remove updater and restore camera to original state
scene.camera.frame.removeUpdater(updateCurve);
await scene.play(new Restore(scene.camera.frame));`
  },
  {
    name: "Point With Trace",
    code: `// Note: The "scene" object and all manim-web exports are available globally.
// However, when using manim-web in your own project, you must import and configure them.
// See the API reference for more info: https://maloyan.github.io/manim-web/api


const path = new VMobject();
path.fillOpacity = 0;
const dot = new Dot();
path.setPointsAsCorners([dot.getCenter(), dot.getCenter()]);

const updatePath = (pathMob) => {
  const previousPath = pathMob.copy();
  previousPath.addPointsAsCorners([dot.getCenter()]);
  pathMob.become(previousPath);
};
path.addUpdater(updatePath);

scene.add(path, dot);

await scene.play(new Rotating(dot, { angle: Math.PI, aboutPoint: RIGHT, duration: 2 }));
await scene.wait();
await scene.play(new Shift(dot, { direction: UP }));
await scene.play(new Shift(dot, { direction: LEFT }));
await scene.wait();`
  },
  {
    name: "Polygon On Axes",
    code: `// Note: The "scene" object and all manim-web exports are available globally.
// However, when using manim-web in your own project, you must import and configure them.
// See the API reference for more info: https://maloyan.github.io/manim-web/api


const ax = new Axes({
  xRange: [0, 10],
  yRange: [0, 10],
  xLength: 6,
  yLength: 6,
  tips: false,
});

const t = new ValueTracker(5);
const k = 25;

const graph = ax.plot((x) => k / x, { color: YELLOW_D, xRange: [k / 10, 10.0], numSamples: 750 });

function makeRectangle() {
  const corners = getRectangleCorners([0, 0], [t.getValue(), k / t.getValue()]);
  const vertices = corners.map(([x, y]) => ax.c2p(x, y));
  const p = new Polygon({ vertices, strokeWidth: 1, color: YELLOW_B, fillOpacity: 0.5 });
  p.fillColor = BLUE;
  return p;
}

const polygon = makeRectangle();
polygon.addUpdater(() => {
  polygon.become(makeRectangle());
});

const dot = new Dot();
dot.addUpdater(() => dot.moveTo(ax.c2p(t.getValue(), k / t.getValue())));

scene.add(ax, graph);
await scene.play(new Create(polygon));
scene.add(dot);
await scene.play(t.animateTo(10));
await scene.play(t.animateTo(k / 10));
await scene.play(t.animateTo(5));

function getRectangleCorners(bottomLeft, topRight) {
  return [
    [topRight[0], topRight[1]],
    [bottomLeft[0], topRight[1]],
    [bottomLeft[0], bottomLeft[1]],
    [topRight[0], bottomLeft[1]],
  ];
}`
  },
  {
    name: "Moving Zoomed Scene Around",
    code: `// Note: The "scene" object and all manim-web exports are available globally.
// However, when using manim-web in your own project, you must import and configure them.
// See the API reference for more info: https://maloyan.github.io/manim-web/api


scene.addForegroundMobject(zdRect);

const unfoldCamera = new UpdateFromFunc(zdRect, (rect) => {
  rect.replace(zoomedDisplay);
});

frameText.nextTo(frame, DOWN);

await scene.play(new Create(frame), new FadeIn(frameText, { shift: UP }));
scene.activateZooming();

// Pop-out animation: display pops from frame position to its shifted position
await scene.play(scene.getZoomedDisplayPopOutAnimation(), unfoldCamera);

zoomedCameraText.nextTo(zoomedDisplayFrame, DOWN);
await scene.play(new FadeIn(zoomedCameraText, { shift: UP }));

// Scale frame and display non-uniformly
await scene.play(
  new Scale(frame, { scaleFactor: [0.5, 1.5, 0] }),
  new Scale(zoomedDisplay, { scaleFactor: [0.5, 1.5, 0] }),
  new FadeOut(zoomedCameraText),
  new FadeOut(frameText),
);
await scene.wait();

await scene.play(new ScaleInPlace(zoomedDisplay, { scaleFactor: 2 }));
await scene.wait();

await scene.play(new Shift(frame, { direction: scaleVec(2.5, RIGHT) }));
await scene.wait();

// Reverse pop-out: move display back to frame
await scene.play(
  scene.getZoomedDisplayPopOutAnimation({ rateFunc: (t: number) => smooth(1 - t) }),
  unfoldCamera,
);
await scene.play(new Uncreate(zoomedDisplayFrame), new FadeOut(frame));
await scene.wait();`
  }
];
