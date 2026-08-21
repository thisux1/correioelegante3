import { AbsoluteFill, Sequence } from "remotion";
import { TitleScene } from "./scenes/TitleScene";
import { IdeaScene } from "./scenes/IdeaScene";
import { LandingScene } from "./scenes/LandingScene";
import { EditorScene } from "./scenes/EditorScene";
import { PaymentScene } from "./scenes/PaymentScene";
import { StackScene } from "./scenes/StackScene";
import { ClosingScene } from "./scenes/ClosingScene";
import { SCENES } from "./constants";

export const CorreioEleganteDemo: React.FC = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: "#fdf2f8" }}>
      <Sequence from={SCENES.title.from} durationInFrames={SCENES.title.duration}>
        <TitleScene />
      </Sequence>

      <Sequence from={SCENES.idea.from} durationInFrames={SCENES.idea.duration}>
        <IdeaScene />
      </Sequence>

      <Sequence from={SCENES.landing.from} durationInFrames={SCENES.landing.duration}>
        <LandingScene />
      </Sequence>

      <Sequence from={SCENES.editor.from} durationInFrames={SCENES.editor.duration}>
        <EditorScene />
      </Sequence>

      <Sequence from={SCENES.payment.from} durationInFrames={SCENES.payment.duration}>
        <PaymentScene />
      </Sequence>

      <Sequence from={SCENES.stack.from} durationInFrames={SCENES.stack.duration}>
        <StackScene />
      </Sequence>

      <Sequence from={SCENES.closing.from} durationInFrames={SCENES.closing.duration}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
