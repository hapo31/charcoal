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
  rotate: number;
  onLoadPDF: (doc: PDFDocumentProxy) => void;
  onLoadPDFPageBegin?: () => void;
  onLoadPDFPage?: (doc: PDFPageProxy) => void;
};
export default React.forwardRef<HTMLImageElement, Props>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [renderResults, setRenderResults] = useState<
    ({ url: string; rotate: number } | null)[]
  >([]);
  const [renderQueue, setRenderQueue] = useState<number[]>([]);
  const [pdfDoc, setPDFDoc] = useState<PDFDocumentProxy | null>(null);
  const [{ width, height }, setViewPort] = useState({ width: 0, height: 0 });
  const [prevRotate, setPrevRotate] = useState(props.rotate);

  const renderPage = useCallback(
    (page: PDFPageProxy) => {
      const container = containerRef.current;
      console.log(`start rendering:${page.pageNumber}`);
      if (pdfDoc == null || container == null) {
        return;
      }
      const fixedViewPort = page.getViewport({
        scale: 2.0,
        rotation: props.rotate * 90,
      });
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
        renderResults[page.pageNumber - 1] = {
          url: canvas.toDataURL(),
          rotate: props.rotate,
        };
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
    [pdfDoc, renderResults, props.rotate]
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
      if (props.rotate != prevRotate) {
        setRenderResults(new Array(pdfDoc.numPages).fill(null));
      }

      // まだそのページを描画してない && そのページが描画中でない
      if (
        renderResults[props.page - 1] == null &&
        renderQueue.findIndex(v => v === props.page) < 0
      ) {
        setRenderQueue([...renderQueue, props.page]);
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
    setPrevRotate(props.rotate);
  }, [pdfDoc, renderQueue, renderResults, props.page, props.rotate]);

  return (
    <Container ref={containerRef}>
      {renderResults[props.page - 1] == null ? (
        <DummyContainer width={width} height={height}>
          <Loading />
        </DummyContainer>
      ) : null}
      {renderResults.map((result, i) =>
        i === props.page - 1 && result != null ? (
          <Img key={`pdf-result-${i}`} ref={ref} src={result.url} />
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
