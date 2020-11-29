import React, { createContext, useCallback, useRef, useState } from "react";
import styled from "styled-components";
import { createWorker, Worker } from "tesseract.js";
import copy from "clipboard-copy";

import {
  useAppReducer,
  StartJob,
  UpdateProgress,
  JobComplete,
  JobError,
  ImageLoaded,
  initialState as appInitialState,
  SetShowCopied,
  SetShowRectangleIndex,
} from "../reducer/useAppReducer";

import DnDArea from "../components/DnDArea";
import ResultView from "../components/ResultView";
import ImageViewerContainer from "./ImageViewerContainer";

type LoggerResult = {
  workerId: string;
  jobId: string;
  status: string;
  progress: number;
};

export const AppContext = createContext(appInitialState);

export default () => {
  const [timer, setTimer] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const [appState, dispatchAppState] = useAppReducer(appInitialState);

  const onChangeFile = useCallback((event: React.ChangeEvent) => {
    const input = event.target as HTMLInputElement;
    if (input == null || input.files == null) {
      return;
    }

    const reader = new FileReader();
    const file = input.files[0];
    if (file.type.indexOf("image") >= 0) {
      reader.onload = () => {
        dispatchAppState(ImageLoaded(reader.result as string, "image"));
      };
    } else if (file.type.indexOf("pdf") >= 0) {
      reader.onload = () => {
        dispatchAppState(ImageLoaded(reader.result as string, "pdf"));
      };
    } else {
      // TODO: なにかエラーメッセージ
      return;
    }
    reader.readAsDataURL(file);
  }, []);

  const onDrop = useCallback(async (event: React.DragEvent) => {
    const files = event.dataTransfer.files;
    const reader = new FileReader();
    const file = files.item(0);
    if (file == null) {
      return;
    }
    if (file.type.indexOf("image") >= 0) {
      reader.onload = () => {
        dispatchAppState(ImageLoaded(reader.result as string, "image"));
      };
    } else if (file.type.indexOf("pdf") >= 0) {
      reader.onload = () => {
        dispatchAppState(ImageLoaded(reader.result as string, "pdf"));
      };
    } else {
      // TODO: なにかエラーメッセージ
      return;
    }

    reader.readAsDataURL(file);
  }, []);

  const onClick = useCallback(async () => {
    const input = inputRef.current;
    if (input == null) {
      return;
    }
    input.accept = "image/*,.pdf";
    input.click();
  }, []);

  const onAddTask = useCallback(async (resultImage: HTMLCanvasElement) => {
    const worker = createWorker({
      logger: (m: LoggerResult) => {
        dispatchAppState(UpdateProgress(m.jobId, m.progress));
      },
    });

    await recognize(
      worker,
      resultImage,
      jobId => {
        dispatchAppState(StartJob(jobId));
      },
      (jobId, text) => {
        dispatchAppState(JobComplete(jobId, text));
      }
    ).catch(({ jobId, error }: { jobId: string; error: any }) => {
      console.error(error);
      dispatchAppState(JobError(jobId));
    });
  }, []);

  return (
    <>
      <RootContainer>
        <ImageContainer>
          {appState.imageSrc == null ? (
            <>
              <DnDArea onClick={onClick} onDrop={onDrop}>
                ここをクリックして画像かPDFを選択
              </DnDArea>
              <Input ref={inputRef} onChange={onChangeFile} />
            </>
          ) : (
            <AppContext.Provider value={appState}>
              <ImageViewerContainer onAddTask={onAddTask} />
            </AppContext.Provider>
          )}
        </ImageContainer>
        <ResultContainer>
          <ResultTitle>結果</ResultTitle>
          {appState.ocrResults.map((result, i) => (
            <>
              <ResultView
                onClick={text => {
                  if (timer !== -1) {
                    clearTimeout(timer);
                  }
                  copy(text);
                  dispatchAppState(SetShowCopied(i));
                  setTimer(
                    setTimeout(() => {
                      dispatchAppState(SetShowCopied(-1));
                      setTimer(-1);
                    }, 1000)
                  );
                }}
                onMouseEnter={() => {
                  dispatchAppState(SetShowRectangleIndex(i));
                }}
                onMouseLeave={() => {
                  dispatchAppState(SetShowRectangleIndex(-1));
                }}
                isComplete={result.isCompleted}
                progress={result.progress}
                text={result.text}
                key={`result-${i}`}
              />
              {appState.showCopied === i ? (
                <Overray key={`overray-${i}`}>コピーしました</Overray>
              ) : null}
            </>
          ))}
        </ResultContainer>
      </RootContainer>
      <HowTo>
        <h2>使い方</h2>
        <h3>概要</h3>
        <p>
          画像やPDFを読み込み、範囲を指定した場所の文字を読み取って文章データ化します。
          読み取った文章は、結果が表示されている部分をクリックするとコピペ出来ます。
        </p>
        <p>
          文字は、あらかじめ正しい向きになるようにしておいてください。現在、左回転や右回転、上下逆だと読み取れません。
        </p>
        <p>
          また、文字が上手く読み取れないときは画像サイズを工夫したり、一度に読み取る範囲を小さくすると上手く行くかもしれません。
        </p>
        <h3>手順</h3>
        <ul>
          <li>
            「ここをクリックして画像かPDFを選択」を押して画像かPDFファイルを選ぶ（PCの場合はドラッグアンドドロップでもOK）
          </li>
          <li>
            画像が表示されたら、読み取る範囲をタッチやドラッグアンドドロップで選択
          </li>
          <li>
            しばらくすると、「結果」という欄に読み取り結果が出てきます（どの範囲を読み取ったかは、マウスを重ねたり一度タップすると赤い四角形が描画されて分かるようになります）
          </li>
        </ul>
      </HowTo>
    </>
  );
};

const RootContainer = styled.main`
  background-color: #333;
  display: flex;
  height: 100%;
  min-height: 92vh;
  width: 100%;
  @media (max-width: 768px) {
    display: block;
    height: auto;
  }
`;

const Input = styled.input.attrs(() => ({
  type: "file",
  accept: "image/*",
}))`
  display: none;
`;

const ImageContainer = styled.div`
  flex: 5 1;
  @media (max-width: 768px) {
    height: 60vh;
    width: 100%;
    flex: initial;
  }
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
  @media (max-width: 768px) {
    flex: initial;
    max-width: 100%;
    min-width: 0px;
    width: 100%;
    height: 20%;
  }
`;

const Overray = styled.div`
  user-select: none;
  background-color: rgba(128, 128, 128, 0.3);
  color: white;
  font-weight: bold;
  text-align: center;
  width: 100%;
  margin-top: -15%;
  margin-bottom: 4px;
  @media (max-width: 768px) {
    background-color: rgba(200, 200, 200, 1);
    color: #777;
    font-size: 27px;
    height: 30px;
    margin-top: 0;
    padding-bottom: 10px;
    position: fixed;
    bottom: 0;
  }
`;

const HowTo = styled.article`
  color: #fefefe;
`;

async function recognize(
  worker: Worker,
  imageLike: Tesseract.ImageLike,
  onStartJob: (jobId: string) => void,
  onCompleteJob: (jobId: string, text: string) => void
) {
  const workerResult = await worker.load();
  try {
    onStartJob(workerResult.jobId);
    await worker.loadLanguage("jpn");
    await worker.initialize("jpn");

    const {
      data: { text },
    } = await worker.recognize(imageLike);
    await worker.terminate();

    onCompleteJob(workerResult.jobId, text.replace(/\s/g, ""));
  } catch (e) {
    throw { jobId: workerResult.jobId, error: e };
  }
}
