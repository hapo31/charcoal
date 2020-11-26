import React, { useEffect, useRef } from "react";
import styled from "styled-components";
import { PDFJS, PDFJSStatic } from "pdfjs-dist";

type Props = {

};

export default (props: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{
    if(containerRef.current) {
      PDFJS.PDFViewer({ container: containerRef.current });
    }
  }, []);

  return <Container ref={containerRef}></Container>
};

const Container = styled.div`

`;
