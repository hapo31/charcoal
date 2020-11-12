import React, { useCallback, useState } from "react";
import styled from "styled-components";

type Props = {
  onDrop: (event: React.DragEvent) => void;
  onClick: () => void;
  children?: React.ReactNode;
};

export default (props: Props) => {
  const [isDragover, setDragover] = useState(false);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    props.onDrop(event);
    setDragover(false);
  }, [props.onDrop]);

  const preventDefault = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setDragover(true);
  }, []);

  const onDragLeave = useCallback((event: React.DragEvent) => {
    setDragover(false);
  }, []);

  return <Container isDragover={isDragover}
            onClick={props.onClick}
            onDrag={preventDefault}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop} >
    {props.children}
  </Container>
}

const Container = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: dashed 3px gray;
  border-radius: 30px;

  background-color: ${({isDragover}: {isDragover: boolean}) => isDragover ? "rgba(200,200,200, 0.3)": "inherit"};
  
`;