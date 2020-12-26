import React, { useCallback, useContext } from "react";
import ImageCropper from "../components/ImageCropper";
import {
  AcceptFileType,
  Actions,
  SetPageNum,
} from "../reducer/useAppReducer";
import { AppContext } from "./App";

type Props = {
  dispatch: React.Dispatch<Actions>;
  onAddTask: (resultImage: HTMLCanvasElement) => void;
  onLoad: (fileType: AcceptFileType, maxPages?: number) => void;
};

export default (props: Props) => {
  const appState = useContext(AppContext);

  const onAddRect = useCallback((resultImage: HTMLCanvasElement) => {
    props.onAddTask(resultImage);
  }, []);

  const onLoad = useCallback((fileType: AcceptFileType, maxPages?: number) => {
    props.onLoad(fileType, maxPages);
  }, []);

  const onChangePageNum = useCallback((value: number) => {
    props.dispatch(SetPageNum(value));
  }, []);

  return (
    <ImageCropper
      fileType={appState.fileType}
      src={appState.imageSrc || ""}
      page={appState.pageNum}
      maxPages={appState.maxPages}
      onAddRect={onAddRect}
      onLoad={onLoad}
      onChangePageNum={onChangePageNum}
    />
  );
};
