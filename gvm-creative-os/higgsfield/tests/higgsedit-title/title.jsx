// GVM kinetic title — Higgsedit (native CLI f39e3bc5882b), rendered in the Higgsfield sandbox.
// Run: higgsedit fonts add . "Bebas Neue" "Inter:400" && higgsedit build title.jsx
// Notes from QA: Inter in Higgsedit has no Cyrillic (use Montserrat for Russian);
// the film-grain effect draws vertical scratch lines, so it is not used here.
const W = 1080, H = 1920, GOLD = "#f5b942";
const word = (t, i) => (
  <frame name={"W" + i} width={W - 160} height={190} layout="none">
    <text width={W - 160} height={190} fontFamily="Bebas Neue" fontSize={210} letterSpacing={6} color="#ffffff">{t}</text>
  </frame>
);
const rise = (i) => ({ parallel: [
  { target: "W" + i, from: { y: 140 }, to: { y: 0 }, duration: 0.6, easing: { kind: "overshoot", amount: 1.2 } },
  // opacity gets its own tween: overshoot would push it above 1, which Higgsedit refuses
  { target: "W" + i, from: { opacity: 0 }, to: { opacity: 1 }, duration: 0.3, easing: "ease-out" },
] });

export default async ({ project }) => {
  const p = await project({ size: `${W}x${H}`, fps: 30, background: "#070b16" });
  p.compose(
    <rect width={W} height={H}
      fill={{ kind: "radial", stops: [{ offset: 0, color: "#1d2b52" }, { offset: 1, color: "#070b16" }] }}
      animate={[{ property: "scale", from: 1.0, to: 1.12, duration: 6, easing: "linear" }]} />,
    { at: 0, dur: 6, name: "BG" });
  p.compose(
    <frame width={W} height={H} padding={{ left: 80, top: 640 }} gap={0} motionBlur={{ samples: 8, shutter: 0.5 }}
      motion={{
        timeline: { stagger: [rise(0), rise(1), rise(2)], each: 0.18, at: 0.3 },
        exit: { to: { opacity: 0, y: -60 }, duration: 0.4, anchor: "end" },
      }}>
      {word("GOOD", 0)}{word("VIBES", 1)}{word("MEDIA", 2)}
    </frame>,
    { at: 0, dur: 6, name: "Headline" });
  p.compose(
    <frame width={W} height={H} layout="none">
      <frame name="Stats" x={80} y={1250} width={900} height={200} layout="none"
        motion={{ enter: { from: { opacity: 0, x: -40 }, duration: 0.5 }, exit: { to: { opacity: 0 }, duration: 0.3, anchor: "end" },
          timeline: { duration: 1.4, easing: "ease-out", at: 0.2, targets: [
            { target: "Bar", from: { scaleX: 0 }, to: { scaleX: 1 } },
            { target: "Num", counter: { from: 0, to: 250, decimals: 0, prefix: "", suffix: "+ ПРОЕКТОВ" } } ] } }}>
        <frame name="Bar" x={0} y={0} width={620} height={10} background={GOLD} />
        <frame name="Num" x={0} y={40} width={900} height={90} layout="none">
          <text width={900} height={90} fontFamily="Montserrat" fontWeight={700} fontSize={72} color={GOLD}>0+ ПРОЕКТОВ</text>
        </frame>
      </frame>
    </frame>,
    { at: 1.4, dur: 4.6, name: "Stats" });
  p.compose(
    <text x={80} y={1520} width={920} height={60} fontFamily="Montserrat" fontWeight={500} fontSize={40} letterSpacing={4} color="#9aa6cf"
      animate={[{ property: "opacity", keyframes: [{ at: 0, value: 0 }, { at: 0.4, value: 1 }, { at: 2.6, value: 1 }, { at: 3, value: 0 }] }]}>
      ВИДЕО · MOTION · AI
    </text>,
    { at: 3, dur: 3, name: "Tag" });
  await p.frame(1.4, "renders/f1.png");
  await p.frame(3.6, "renders/f2.png");
  await p.render("renders/gvm_title.mp4");
};
