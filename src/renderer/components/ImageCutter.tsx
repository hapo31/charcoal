import React, { useCallback, useState } from "react";
import styled from "styled-components";
import Rectangle from "../../domain/Recrangle";


type Props = {
  src: string;
  rectangles: Rectangle[];
  onClickRect?: (rectIndex: number) => void;
  onAddRect: (rect: Rectangle) => void;
};

export default (props: Props) => {
  const [isDragging, setIsDragging] = useState(false);
  const [rect, setRect] = useState<Rectangle | null>(null);
  const [{startX, startY}, setPos] = useState({ startX: -1, startY: -1 });

  const onMouseDown = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    setPos({
      startX: event.pageX,
      startY: event.pageY
    });
    setRect({
      left: event.clientX,
      top: event.clientY,
      right: event.clientX,
      bottom: event.clientY,
    });
    setIsDragging(true);
    console.log("onMouseDown");
  }, []);

  const onMouseMove = useCallback((event: React.MouseEvent) => {
    if (!isDragging || !rect) {
      return;
    }
    event.preventDefault();
    const fixedRect = fixRect({
      left: rect.left,
      top: rect.top,
      right: event.clientX,
      bottom: event.clientY
    });
    setRect(fixedRect);
    console.log({"onMouseMove": fixedRect});
  }, [isDragging, rect]);

  const onMouseUp = useCallback((event: React.MouseEvent) => {
    if (!isDragging) {
      return;
    }
    event.preventDefault();
    const fixedRect = fixRect({
      left: startX,
      top: startY,
      right: event.pageX,
      bottom: event.pageY
    });
    props.onAddRect(fixedRect);
    setIsDragging(false);
    setPos({startX: -1, startY: -1});
    setRect(null);
    console.log({"onMouseUp": fixedRect});
  }, [isDragging]);

  const createOnClickRect = useCallback((index: number) => {
    return () => {
      if (!props.onClickRect) {
        return;
      }
      props.onClickRect(index);
    }
  }, [props.rectangles]);

  return <Container
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp} // マウスが要素外に出たとき、mouseUpと同じ処理をする
          >
    <img src={props.src} style={{float: "left"}} alt=""/>
    {rect ? <Rect position="fixed" {...rect} /> : null}
    {props.rectangles.map((rect, i) => <Rect position="absolute" key={`rect-${i}`} {...rect} onClick={createOnClickRect(i)} />)}
  </Container>
};


const Container = styled.div`
  width: 100%;
  height: 100%;
`;

type RectProps = Partial<Rectangle> & {
  position: "fixed" | "absolute";
};

const Rect = styled.div`
  position: ${({position}: RectProps) => position};
  left: ${({left}: RectProps) => `${left}px`};
  top: ${({top}: RectProps) => `${top}px`};

  width:  ${({left, right}: RectProps) => `${(right || 0) - (left || 0)}px`};
  height:  ${({top, bottom}: RectProps) => `${(bottom || 0) - (top || 0)}px`};

  border: 2px solid red;
`;

function fixRect(rect: Rectangle): Rectangle {
  const { left, right } = rect.left < rect.right ?
          { left: rect.left, right: rect.right } :
          { left: rect.right, right: rect.left };

  const { top, bottom } = rect.top < rect.bottom ?
          { top: rect.top, bottom: rect.bottom } :
          { top: rect.bottom, bottom: rect.top };

  return {
    left, top, right, bottom
  }
}
