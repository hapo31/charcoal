import React, { useCallback, useState } from "react";
import styled from "styled-components";
import Rectangle from "../../domain/Recrangle";


type Props = {
  src: string;
  rectangles: Rectangle[];
  onClickRect: (rectIndex: number) => void;
  onAddRect: (rect: Rectangle) => void;
};

export default (props: Props) => {
  const [rect, setRect] = useState<Rectangle | null>(null);

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    setRect({
      left: event.clientX,
      top: event.clientY,
      right: event.clientX,
      bottom: event.clientY
    });
  }, []);

  const onMouseUp = useCallback((event: React.MouseEvent) => {
    if (!rect) {
      return;
    }

    const left = rect.left < event.clientX ? rect.left : event.clientX;
    const top = rect.top < event.clientY ? rect.top : event.clientY;
    const right = rect.left < event.clientX ? event.clientX : rect.left;
    const bottom = rect.top < event.clientY ? event.clientY : rect.top;

    props.onAddRect({ left, top, right, bottom });
    setRect(null);
  }, []);

  const onMouseMove = useCallback((event: React.MouseEvent) => {
    if (!rect) {
      return;
    }
    setRect({
      left: rect.left,
      top: rect.top,
      right: event.clientX,
      bottom: event.clientY
    });
  }, []);


  const createOnClickRect = useCallback((index: number) => {
    return () => {
      props.onClickRect(index);
    }
  }, [props.rectangles]);

  return <Container onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp}>
    {rect ? <Rect {...rect} /> : null}
    {props.rectangles.map((rect, i) => <Rect {...rect} onClick={createOnClickRect(i)} />)}
  </Container>
};


const Container = styled.div`
  width: 100%;
  height: 100%;
`;


type RectProps = Partial<Rectangle>;

const Rect = styled.div`
  position: fixed;
  left: ${({left}: RectProps) => `${left}px`};
  top: ${({top}: RectProps) => `${top}px`};
  
  width:  ${({left, right}: RectProps) => `${(right || 0) - (left || 0)}px`};
  height:  ${({top, bottom}: RectProps) => `${(bottom || 0) - (top || 0)}px`};
  
  border: 2px solid red;
`;