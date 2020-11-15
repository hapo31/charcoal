import React, { useCallback } from "react";
import styled from "styled-components";
import { render } from "react-dom";
import { ipcRenderer } from "electron";
import { createWorker, Worker } from "tesseract.js";

import { useAppReducer, AddRect, ImageLoaded, StartJob, UpdateProgress, JobComplete, JobError } from "./reducer/useAppReducer";
import DnDArea from "./components/DnDArea";
import ImageCutter from "./components/ImageCutter";
import Rectangle from "../domain/Recrangle";
import ResultView from "./components/ResultView";

type LoggerResult = {
  workerId: string;
  jobId: string;
  status: string;
  progress: number;
};

const RootContainer = styled.div`
  display: flex;
  height: 99vh;
  width: 100%;
`;

const ImageContainer = styled.div`
  flex: 5 1;
`;

const ResultContainer = styled.div`
  justify-content: center;
  min-width: 100px;
  max-width: 200px;
  flex-grow: 1;
  overflow-y: scroll;
  border-left: solid 2px gray;
`;

const App = () => {
  const [state, dispatch] = useAppReducer({
    imageSrc: null,
    rectangles: [],
    ocrResults: []
  });

  const onImageLoad = useCallback(async (event: React.ChangeEvent<HTMLImageElement>) => {
    const {width, height} = event.target;
    // await ipcRenderer.invoke("set-window-size", width, height);
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

  const onAddRect = useCallback(async (rect: Rectangle, resultImage: HTMLCanvasElement) => {
    dispatch(AddRect(rect));

    const worker = createWorker({ logger: (m: LoggerResult) => {
      dispatch(UpdateProgress(m.jobId, m.progress));
    }});

    await recognize(worker, resultImage,
      jobId => {
        dispatch(StartJob(jobId));
      },
      (jobId, text) => {
        dispatch(JobComplete(jobId, text));
      }
    ).catch(({jobId, error}: { jobId: string, error: any }) => {
      console.error(error);
      dispatch(JobError(jobId));
    });
  }, []);

  return <RootContainer>
    <ImageContainer>
      {
        state.imageSrc == null ?
          <DnDArea onClick={onClick} onDrop={onDrop}>
            ここにドロップ
          </DnDArea> :
          <ImageCutter
            src={state.imageSrc}
            onLoad={onImageLoad}
            onAddRect={onAddRect}
            rectangles={state.rectangles} />
      }
    </ImageContainer>
    <ResultContainer>
      <p style={{textAlign: "center"}}>結果</p>
      {state.ocrResults.map((result, i) => (
      <ResultView
        isComplete={result.isCompleted}
        progress={result.progress}
        text={result.text}
        key={i} />))}
    </ResultContainer>
  </RootContainer>
};

render(<App />, document.getElementById("app"));

async function recognize(worker: Worker, imageLike: Tesseract.ImageLike, onStartJob: (jobId: string) => void, onCompleteJob: (jobId: string, text: string) => void) {
  const workerResult =  await worker.load();
  try {
    onStartJob(workerResult.jobId);
    await worker.loadLanguage("jpn");
    await worker.initialize("jpn");

    const { data: { text } } = await worker.recognize(imageLike);
    await worker.terminate();

    onCompleteJob(workerResult.jobId, text.replace(/\s/g, ""));
  } catch (e) {
    throw {jobId: workerResult.jobId, error: e};
  }
}
