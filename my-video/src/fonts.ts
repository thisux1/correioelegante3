import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { loadFont as loadDancing } from "@remotion/google-fonts/DancingScript";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";

const playfair = loadPlayfair();
const dancing = loadDancing();
const inter = loadInter();
const jetbrains = loadJetBrains();

// Call waitUntilDone() to ensure fonts are fully loaded during rendering and avoid FOUT
playfair.waitUntilDone();
dancing.waitUntilDone();
inter.waitUntilDone();
jetbrains.waitUntilDone();

export const fontFamily = {
  display: playfair.fontFamily,
  cursive: dancing.fontFamily,
  sans: inter.fontFamily,
  mono: jetbrains.fontFamily,
};

export const waitUntilFontsLoaded = () =>
  Promise.all([
    playfair.waitUntilDone(),
    dancing.waitUntilDone(),
    inter.waitUntilDone(),
    jetbrains.waitUntilDone(),
  ]);

