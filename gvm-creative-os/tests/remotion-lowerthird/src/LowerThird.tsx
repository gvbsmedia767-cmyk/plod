import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {name: string; role: string};

export const LowerThird = ({name, role}: Props) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const inP = spring({frame, fps, config: {damping: 200}, durationInFrames: 24});
  const outP = interpolate(frame, [durationInFrames - 20, durationInFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.in(Easing.cubic),
  });
  const bar = interpolate(inP, [0, 1], [0, 640]);
  const textX = interpolate(inP, [0, 1], [-60, 0]);
  const opacity = inP * (1 - outP);
  // title-safe margin: 10% of frame
  return (
    <AbsoluteFill style={{background: 'linear-gradient(135deg,#0b1020,#1b2a4a)', fontFamily: 'Inter, Arial, sans-serif'}}>
      <div style={{position: 'absolute', left: 192, bottom: 162, opacity, transform: `translateX(${-outP * 80}px)`}}>
        <div style={{height: 6, width: bar, background: '#f5b942', marginBottom: 18, borderRadius: 3}} />
        <div style={{fontSize: 72, fontWeight: 800, color: '#fff', letterSpacing: 2, transform: `translateX(${textX}px)`}}>{name}</div>
        <div style={{fontSize: 38, fontWeight: 400, color: '#f5b942', marginTop: 8, transform: `translateX(${textX * 1.4}px)`}}>{role}</div>
      </div>
    </AbsoluteFill>
  );
};
