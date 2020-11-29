import React, { useCallback, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
  GlobalWorkerOptions,
  getDocument,
  PDFDocumentProxy,
  PDFPageProxy,
} from "pdfjs-dist";
import Loading from "./Loading";

type Props = {
  src: string;
  page: number;
  onLoadPDF: (doc: PDFDocumentProxy) => void;
  onLoadPDFPageBegin?: () => void;
  onLoadPDFPage?: (doc: PDFPageProxy) => void;
};
export default React.forwardRef<HTMLImageElement, Props>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderResults, setRenderResults] = useState<(string | null)[]>([]);
  const [renderQueue, setRenderQueue] = useState<number[]>([]);
  const [pdfDoc, setPDFDoc] = useState<PDFDocumentProxy | null>(null);
  const [{ width, height }, setViewPort] = useState({ width: 0, height: 0 });

  const renderPage = useCallback(
    (page: PDFPageProxy) => {
      const container = containerRef.current;
      console.log(`start rendering:${page.pageNumber}`);
      if (pdfDoc == null || container == null) {
        return;
      }
      const testViewport = page.getViewport({ scale: 2.0, rotation: 0 });
      const scale = getViewPortScale(testViewport, {
        width: container.clientWidth,
        height: container.clientHeight,
      });
      const fixedViewPort = page.getViewport({ scale, rotation: 0 });
      const canvas = document.createElement("canvas");
      setViewPort(fixedViewPort);
      canvas.height = fixedViewPort.height;
      canvas.width = fixedViewPort.width;
      const ctx = canvas.getContext("2d");
      if (ctx == null) {
        return;
      }
      const task = page.render({
        canvasContext: ctx,
        viewport: fixedViewPort,
      });
      task.promise.then(() => {
        if (props.onLoadPDFPage == null) {
          return;
        }
        props.onLoadPDFPage(page);
        renderResults[page.pageNumber - 1] = canvas.toDataURL();
        setRenderResults([...renderResults]);
        renderQueue.splice(
          renderQueue.findIndex(v => v === page.pageNumber),
          1
        );
        setRenderQueue([...renderQueue]);
        console.log(`fininsh rendering:${page.pageNumber}`);
        if (renderQueue.length > 0) {
          pdfDoc.getPage(renderQueue[0]).then(renderPage);
        }
      });
    },
    [pdfDoc, renderResults]
  );

  useEffect(() => {
    if (pdfDoc == null) {
      GlobalWorkerOptions.workerSrc = "./pdf.worker.min.js";
      getDocument(props.src).promise.then(doc => {
        setPDFDoc(doc);
        setRenderResults(new Array(doc.numPages).fill(null));
        props.onLoadPDF(doc);
      });
    } else {
      // まだそのページを描画してない
      if (renderResults[props.page - 1] == null) {
        // そのページが描画中なら描画しない
        if (renderQueue.findIndex(v => v === props.page) >= 0) {
          return;
        }
        if (renderQueue.length === 0) {
          if (props.onLoadPDFPageBegin) {
            props.onLoadPDFPageBegin();
          }
          setTimeout(() => {
            // レンダリング待ちが一つも無ければレンダリング開始
            pdfDoc.getPage(props.page).then(renderPage);
          });
        } else {
          // すでに進行中のレンダータスクがあればキューイング
          setRenderQueue([...renderQueue, props.page]);
        }
      }
    }

    return () => {
      // if(pdfDoc == null) {
      //   return;
      // }
      // pdfDoc.destroy();
    };
  }, [pdfDoc, renderQueue, renderResults, props.page]);

  return (
    <Container ref={containerRef}>
      {renderResults[props.page - 1] == null ? (
        <DummyContainer width={width} height={height}>
          <Loading />
        </DummyContainer>
      ) : null}
      {renderResults.map((url, i) =>
        i === props.page - 1 && url != null ? (
          <Img key={`pdf-result-${i}`} ref={ref} src={url} />
        ) : null
      )}
    </Container>
  );
});

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

type ViewPort = {
  width: number;
  height: number;
};

const DummyContainer = styled.div`
  max-width: 100vh;
  width: ${({ width }: ViewPort) => `${width}px`};
  height: ${({ height }: ViewPort) => `${height}px`};
`;

const Img = styled.img`
  max-width: 100%;
`;

function getViewPortScale(src: ViewPort, target: ViewPort) {
  if (src.width > src.height) {
    return src.width / target.width;
  } else {
    return src.height / target.height;
  }
}
