import React, { useCallback, useState } from "react";
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

const App = () => {
  const [showRectIndex, setShowRectIndex] = useState(-1);
  const [showCopied, setShowCompied] = useState(-1);

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

  return <>
    <RootContainer>
      <ImageContainer>
        {
          state.imageSrc == null ?
            <DnDArea onClick={onClick} onDrop={onDrop}>
              ここにドロップ
            </DnDArea> :
            <ImageCutter
              showRectangleIndex={showRectIndex}
              src={state.imageSrc}
              onLoad={onImageLoad}
              onAddRect={onAddRect}
              rectangles={state.rectangles} />
        }
      </ImageContainer>
      <ResultContainer>
        <ResultTitle>結果</ResultTitle>
        {state.ocrResults.map((result, i) => (
        <>
          <ResultView
            onClick={text => {
              ipcRenderer.invoke("set-text-clipboard", text);
              setShowCompied(i);
              setTimeout(()=>{
                setShowCompied(-1);
              }, 1000);
            }}
            onMouseEnter={()=>{
              setShowRectIndex(i);
            }}
            onMouseLeave={()=>{
              setShowRectIndex(-1);
            }}
            isComplete={result.isCompleted}
            progress={result.progress}
            text={result.text}
            key={`result-${i}`} />
          {showCopied === i ? <Overray key={`overray-${i}`}>
            コピーしました
          </Overray> : null}
        </>
          ))}
      </ResultContainer>
    </RootContainer>
    <HowTo>
      <h2>
        使い方
      </h2>
    </HowTo>
  </>
};

const RootContainer = styled.main`
  background-color: #333;
  display: flex;
  height: 99vh;
  width: 100%;
`;

const ImageContainer = styled.div`
  flex: 5 1;
`;

const ResultTitle = styled.h2`
  margin-top: 3px;
  font-size: 15px;
  color: #777;
  font-weight: bold;
  text-align: center;
`;

const ResultContainer = styled.div`
  background-color: #efefef;
  justify-content: center;
  min-width: 100px;
  max-width: 200px;
  flex-grow: 1;
  overflow-y: scroll;
`;

const Overray = styled.div`
  user-select: none;
  background-color: rgba(128, 128, 128, 0.3);
  color: white;
  font-weight: bold;
  text-align: center;
  width: 100%;
  margin-top: -15%;
`;

const HowTo = styled.article`
  color: #fefefe;
`;

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

render(<App />, document.getElementById("app"));

