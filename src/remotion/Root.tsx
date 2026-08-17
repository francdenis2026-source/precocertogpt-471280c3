import React from "react";
import { Composition } from "remotion";
import { OfferVideo, defaultOfferVideoProps } from "./OfferVideo";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="PrecoCertoOfertasVertical"
      component={OfferVideo}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={450}
      defaultProps={defaultOfferVideoProps}
    />
  </>
);
