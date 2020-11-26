import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { GlobalWorkerOptions, getDocument, PDFDocumentProxy } from "pdfjs-dist";
import Loading from "./Loading";

type Props = {
  src: string;
  page: number;
};
export default React.forwardRef<HTMLCanvasElement, Props>((props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPDFDoc] = useState<PDFDocumentProxy | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (pdfDoc == null) {
      GlobalWorkerOptions.workerSrc = "./pdf.worker.min.js";
      getDocument(props.src).promise.then(doc => {
        setPDFDoc(doc);
      });
    } else {
      setIsLoading(true);
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
        });
      });
    }
  }, [pdfDoc, props.page]);

  return <Container ref={containerRef}>
    {isLoading ? <Loading /> : null}
    <canvas ref={ref = canvasRef}></canvas>
  </Container>
});

const Container = styled.div`
  width: 100%;
  height: 100%;
`;
