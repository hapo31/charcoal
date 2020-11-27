import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { GlobalWorkerOptions, getDocument, PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
import Loading from "./Loading";

type Props = {
  src: string;
  page: number;
  onLoadPDF: (doc: PDFDocumentProxy) => void;
  onLoadPDFPageBegin?: () => void;
  onLoadPDFPage?: (doc: PDFPageProxy) => void;
};
export default React.forwardRef<HTMLCanvasElement, Props>((props, canvasRef) => {
  const [pdfDoc, setPDFDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pdfDoc == null) {
      GlobalWorkerOptions.workerSrc = "./pdf.worker.min.js";
      getDocument(props.src).promise.then(doc => {
        setPDFDoc(doc);
        props.onLoadPDF(doc);
      });
    } else {
      if (canvasRef == null || typeof canvasRef !== "object") {
        return;
      }
      setIsLoading(true);
      if (props.onLoadPDFPageBegin) {
        props.onLoadPDFPageBegin();
      }
      if (canvasRef.current == null) {
        return;
      }
      canvasRef.current.height = 0;
      canvasRef.current.width = 0;
      pdfDoc.getPage(props.page).then(page => {
        const viewport = page.getViewport({ scale: 1, rotation: 0 });
        if (canvasRef.current == null) {
          return;
        }
        canvasRef.current.height = viewport.height;
        canvasRef.current.width = viewport.width;
        const ctx = canvasRef.current.getContext("2d");
        if (ctx == null) {
          return;
        }
        const task = page.render({
          canvasContext: ctx,
          viewport
        });

        task.promise.then(() => {
          setIsLoading(false);
          if(props.onLoadPDFPage == null) {
            return;
          }
          props.onLoadPDFPage(page);
        });
      });
    }

    return () => {
      if(pdfDoc == null) {
        return;
      }
      pdfDoc.destroy();
    }
  }, [pdfDoc, props.page]);

  return <Container>
    {isLoading ? <Loading /> : null}
    <canvas ref={canvasRef}></canvas>
  </Container>
});

const Container = styled.div`
  width: 100%;
  height: 100%;
`;
