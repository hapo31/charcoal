import React, { useCallback, useRef, useState } from "react";
import styled from "styled-components";
import Rectangle from "../../domain/Recrangle";


type Props = {
  src: string;
  rectangles: Rectangle[];
  showRectangleIndex: number;
  onLoad: (event: React.ChangeEvent<HTMLImageElement>) => void;
  onClickRect?: (rectIndex: number) => void;
  onAddRect: (rect: Rectangle, resultImage: HTMLCanvasElement) => void;
};

export default (props: Props) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rect, setRect] = useState<Rectangle | null>(null);
  const [{startX, startY}, setPos] = useState({ startX: -1, startY: -1 });
  const [{startResultX, startResultY}, setResult] = useState({ startResultX: -1, startResultY: -1 });

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
    setResult({
      startResultX: event.pageX,
      startResultY: event.pageY
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
  }, [isDragging, rect]);

  const onMouseUp = useCallback((event: React.MouseEvent) => {
    if (!isDragging) {
      return;
    }
    event.preventDefault();

    setIsDragging(false);
    setPos({startX: -1, startY: -1});
    setRect(null);

    const fixedRect = fixRect({
      left: startX,
      top: startY,
      right: event.pageX,
      bottom: event.pageY
    });

    const scaleFactor = window.devicePixelRatio;

    const fixedResultRect = fixRect({
      left: startResultX,
      top: startResultY,
      right: event.pageX,
      bottom: event.pageY
    });

    const width = fixedResultRect.right - fixedResultRect.left;
    const height = fixedResultRect.bottom - fixedResultRect.top;

    if (width * height < 100) {
      return;
    }

    const canvas = document.createElement("canvas");

    canvas.width = width * scaleFactor;
    canvas.height = height * scaleFactor;

    const ctx = canvas.getContext("2d");
    if (ctx == null) {
      return;
    }

    const img = imgRef.current;
    if (img == null) {
      return;
    }

    const widthRatio = img.naturalWidth / img.width;
    const heightRatio = img.naturalHeight / img.height;

    ctx.drawImage(img, fixedResultRect.left * widthRatio, fixedResultRect.top * heightRatio, width * widthRatio, height * heightRatio, 0, 0, width * scaleFactor, height * scaleFactor);

    props.onAddRect(fixedRect, canvas);

    console.log({"onMouseUp": fixedRect});
  }, [isDragging, startResultX, startResultY,   imgRef]);

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
            // onMouseLeave={onMouseUp} // マウスが要素外に出たとき、mouseUpと同じ処理をする
          >
    <img src={props.src}
        ref={imgRef}
        onLoad={props.onLoad}
        style={{
          float: "left",
          display: "inline-block",
          width: "100%"
        }} alt=""/>

    {rect ? <Rect color="red" position="fixed" {...rect} /> : null}
    {props.rectangles.map((rect, i) => i === props.showRectangleIndex ?
      <Rect color="red" position="absolute"
        key={`rect-${i}`}
        {...rect}
        onClick={createOnClickRect(i)} /> : null)}
  </Container>
};


const Container = styled.div`
  width: 100%;
  height: 100%;
`;

type RectProps = Partial<Rectangle> & {
  position: "fixed" | "absolute";
  color: string;
};

const Rect = styled.div.attrs((props: RectProps) => ({
  style: {
    position: props.position,
    left: `${props.left}px`,
    top: `${props.top}px`,
    width: `${(props.right || 0) - (props.left || 0)}px`,
    height: `${(props.bottom || 0) - (props.top || 0)}px`,
  }
}))`
  border: 2px solid ${({color}: RectProps) => color};
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
