import React, { useCallback, useContext } from "react";
import ImageCutter from "../components/ImageCropper";
import { AppContext } from "./App";

type Props = {
  onAddTask: (resultImage: HTMLCanvasElement) => void;
};

export default (props: Props) => {
  const appState = useContext(AppContext);

  const onAddRect = useCallback(async (resultImage: HTMLCanvasElement) => {
    props.onAddTask(resultImage);
  }, []);

  const onLoadImage = useCallback(
    async (event: React.ChangeEvent<HTMLImageElement>) => {
      const { width, height } = event.target;
    },
    []
  );

  return (
    <ImageCutter
      fileType={appState.fileType}
      src={appState.imageSrc || ""}
      onAddRect={onAddRect}
      onLoad={onLoadImage}
    />
  );
};
