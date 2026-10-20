import {Composition} from 'remotion';
import {LowerThird} from './LowerThird';

export const Root = () => (
  <Composition
    id="LowerThird"
    component={LowerThird}
    durationInFrames={150}
    fps={30}
    width={1920}
    height={1080}
    defaultProps={{name: 'GOOD VIBES MEDIA', role: 'Video · Motion · AI'}}
  />
);
