import "./index.css";
import { Composition } from "remotion";
import { CorreioEleganteDemo } from "./Composition";
import { WIDTH, HEIGHT, TOTAL_DURATION, FPS } from "./constants";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CorreioEleganteDemo"
        component={CorreioEleganteDemo}
        durationInFrames={TOTAL_DURATION}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
    </>
  );
};
