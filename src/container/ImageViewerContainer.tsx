import React, { useCallback, useContext } from "react";
import ImageCutter from "../components/ImageCutter";
import Rectangle from "../domain/Recrangle";
import { AddRect, useImageReducer } from "../reducer/useImageReducer";
import { AppContext } from "./App";

type Props = {
  onAddTask: (resultImage: HTMLCanvasElement) => void;
};

export default (props: Props) => {
  const appState = useContext(AppContext);

  const [state, dispatchImageState] = useImageReducer({
    rectangles: [],
    fileType: appState.fileType,
  });

  const onAddRect = useCallback(
    async (rect: Rectangle, resultImage: HTMLCanvasElement) => {
      dispatchImageState(AddRect(rect));
      props.onAddTask(resultImage);
    },
    []
  );

  const onLoadImage = useCallback(
    async (event: React.ChangeEvent<HTMLImageElement>) => {
      const { width, height } = event.target;
    },
    []
  );

  return (
    <ImageCutter
      fileType={appState.fileType}
      rectangles={state.rectangles}
      src={appState.imageSrc || ""}
      showRectangleIndex={appState.showRectangleIndex}
      onAddRect={onAddRect}
      onLoad={onLoadImage}
    />
  );
};
