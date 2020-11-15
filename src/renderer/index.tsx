import React, { useCallback } from "react";
import { render } from "react-dom";
import { ipcRenderer } from "electron";
import DnDArea from "./components/DnDArea";
import styled from "styled-components";
import { createWorker, Worker } from "tesseract.js";
import { SetProgress, AddResult, SetStatus, useAppReducer, AddRect, ImageLoaded } from "./reducer/useAppReducer";
import ProgressBar from "./components/ProgressBar";
import ImageCutter from "./components/ImageCutter";
import Rectangle from "../domain/Recrangle";

type LoggerResult = {
  workerId: string;
  jobId: string;
  status: string;
  progress: number;
};

const RootContainer = styled.div`
  height: 90vh;
  width: 100%;
`;

const App = () => {
  const [state, dispatch] = useAppReducer({
    imageSrc: null,
    rectangles: [],
    progress: 0,
    resultTexts: [],
    status: ""
  });

  const onImageLoad = useCallback(async (event: React.ChangeEvent<HTMLImageElement>) => {
    const {width, height} = event.target;
    await ipcRenderer.invoke("set-window-size", width, height);
  }, []);

  const onDrop = useCallback(async (event: React.DragEvent) => {
    const files = event.dataTransfer.files;
    const file = files.item(0);
    if (file == null) {
      return;
    }
    dispatch(ImageLoaded(file.path));
  }, []);


  const onClick = useCallback(async () => {
    const path: string | null = await ipcRenderer.invoke("fileopen-dialog");
    if (!path) {
      return;
    }

    dispatch(ImageLoaded(path));
  },[]);

  const onAddRect = useCallback(async (rect: Rectangle, resultImage: ImageData) => {
    dispatch(AddRect(rect));

    const worker = createWorker({ logger: (m: LoggerResult) => {
      dispatch(SetStatus(m.status));
      dispatch(SetProgress(m.progress));
    }});
    const result = await recognize(worker, resultImage);

    dispatch(AddResult(result));
  }, []);

  return <RootContainer>
    {
      state.imageSrc == null ?
        <DnDArea onClick={onClick} onDrop={onDrop}>
          ここにドロップ
        </DnDArea> : <ImageCutter
                        src={state.imageSrc}
                        onLoad={onImageLoad}
                        onAddRect={onAddRect}
                        rectangles={state.rectangles} />
    }
    <p>{state.status}</p>
    {state.progress !== 0 ? <ProgressBar color="red" percentOf0To1={state.progress} /> : null}
    <p>結果</p>

    {state.resultTexts.map(text => <p>{text}</p>)}
  </RootContainer>
};

render(<App />, document.getElementById("app"));

async function recognize(worker: Worker, imageLike: Tesseract.ImageLike) {
  await worker.load();
  await worker.loadLanguage("jpn");
  await worker.initialize("jpn");
  const { data: { text } } = await worker.recognize(imageLike);
  await worker.terminate();

  console.log({text});

  return text;
}
