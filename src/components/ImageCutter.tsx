import React, { RefObject, useCallback, useRef, useState } from "react";
import styled from "styled-components";
import Rectangle, { Rect } from "../domain/Recrangle";
import PDFView from "../components/PDFView";
import { PDFDocumentProxy } from "pdfjs-dist";
import Controll from "./Controll";

type Props = {
  fileType: "image" | "pdf";
  src: string;
  onLoad: (event: React.ChangeEvent<HTMLImageElement>) => void;
  onClickRect?: (rectIndex: number) => void;
  onAddRect: (resultImage: HTMLCanvasElement) => void;
};

export default (props: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const drawableRef = useRef<HTMLImageElement>(null);
  const [page, setPage] = useState(1);
  const [maxPage, setMaxPage] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [previewRect, setPreviewRect] = useState<Rect | null>(null);
  const [{ startX, startY }, setStartPos] = useState({
    startX: -1,
    startY: -1,
  });
  const [{ startResultX, startResultY }, setResult] = useState({
    startResultX: -1,
    startResultY: -1,
  });

  // const [debugImg, setDebugImg] = useState("");

  const onMouseDown = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      const { pageX, pageY, clientX, clientY } = positionExtract(event);
      if (!isTouchEvent(event)) {
        event.preventDefault();
      }

      const container = containerRef.current;
      if (container == null) {
        return;
      }

      const offsetX = container.offsetLeft;
      const offsetY = container.offsetTop;
      const scrollTop = container.scrollTop;

      setStartPos({
        startX: clientX,
        startY: clientY,
      });

      setPreviewRect({
        left: clientX,
        top: clientY,
        right: clientX,
        bottom: clientY,
      });

      setResult({
        startResultX: pageX - offsetX,
        startResultY: pageY - offsetY + scrollTop,
      });
      setIsDragging(true);
    },
    []
  );

  const onMouseMove = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging || !previewRect) {
        return;
      }
      const { clientX, clientY } = positionExtract(event);
      if (!isTouchEvent(event)) {
        event.preventDefault();
      }
      const fixedRect = fixRect({
        left: startX,
        top: startY,
        right: clientX,
        bottom: clientY,
      });
      setPreviewRect(fixedRect);
    },
    [isDragging, startX, startY]
  );

  const onMouseUp = useCallback(
    (event: React.MouseEvent | React.TouchEvent) => {
      if (!isDragging) {
        return;
      }
      const { pageX, pageY } = positionExtract(event);
      if (!isTouchEvent(event)) {
        event.preventDefault();
      }

      const container = containerRef.current;
      if (container == null) {
        return;
      }

      const offsetX = container.offsetLeft;
      const offsetY = container.offsetTop;
      const scrollTop = container.scrollTop;
      const resultX = pageX - offsetX;
      const resultY = pageY - offsetY + scrollTop;

      setIsDragging(false);
      setStartPos({ startX: -1, startY: -1 });
      setPreviewRect(null);

      const drawable = drawableRef.current;
      if (drawable == null) {
        return;
      }
      const img: HTMLImageElement = drawable;

      const fixedResultRect = new Rectangle(
        container.clientWidth,
        container.clientHeight,
        fixRect({
          left: startResultX,
          top: startResultY,
          right: resultX,
          bottom: resultY,
        })
      );

      const convertedRect = fixedResultRect.convert({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });

      const imgWidth = convertedRect.right - convertedRect.left;
      const imgHeight = convertedRect.bottom - convertedRect.top;

      if (imgWidth * imgWidth < 100) {
        return;
      }

      const canvas = document.createElement("canvas");

      canvas.width = imgWidth;
      canvas.height = imgHeight;

      const ctx = canvas.getContext("2d");
      if (ctx == null) {
        return;
      }

      ctx.drawImage(
        img,
        convertedRect.left,
        convertedRect.top,
        imgWidth,
        imgHeight,
        0,
        0,
        canvas.width,
        canvas.height
      );

      // setDebugImg(canvas.toDataURL());

      props.onAddRect(canvas);
    },
    [isDragging, startResultX, startResultY, drawableRef]
  );

  const onLoadPDF = useCallback((doc: PDFDocumentProxy) => {
    setPage(1);
    setMaxPage(doc.numPages);
  }, []);

  const onLoadPDFPageBegin = useCallback(() => {}, []);

  const onLoadPDFPage = useCallback(() => {}, []);

  const onClickPlus = useCallback((value: number) => {
    setPage(value);
  }, []);

  const onClickMinus = useCallback((value: number) => {
    setPage(value);
  }, []);

  const onChangePage = useCallback((value: number) => {
    setPage(value);
  }, []);

  return (
    <>
      <Container>
        {props.fileType === "pdf" ? (
          <Controll
            pageNum={page}
            maxPage={maxPage}
            onChangePage={onChangePage}
            onClickPlusButton={onClickPlus}
            onClickMinusButton={onClickMinus}
          />
        ) : null}
        <MediaPreviewContainer
          ref={containerRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onTouchStart={onMouseDown}
          onTouchMove={onMouseMove}
          onTouchEnd={onMouseUp}
          // onMouseLeave={onMouseUp} // マウスが要素外に出たとき、mouseUpと同じ処理をする
        >
          {props.fileType === "image" ? (
            <img
              src={props.src}
              ref={drawableRef}
              onLoad={props.onLoad}
              style={{
                display: "inline-block",
                width: "100%",
              }}
              alt=""
            />
          ) : (
            <PDFView
              ref={drawableRef}
              src={props.src}
              page={page}
              onLoadPDF={onLoadPDF}
              onLoadPDFPageBegin={onLoadPDFPageBegin}
              onLoadPDFPage={onLoadPDFPage}
            />
          )}

          {previewRect ? (
            <PreviewRect color="red" position="fixed" {...previewRect} />
          ) : null}
        </MediaPreviewContainer>
      </Container>
      {/* {debugImg !== "" ? <img src={debugImg} alt="" /> : null} */}
    </>
  );
};

const Container = styled.div``;

const MediaPreviewContainer = styled.div`
  overflow-y: ${({ scroll }: { scroll?: boolean }) =>
    scroll ? "scroll" : "hidden"};
  width: 100%;
  height: 100%;
  @media (max-width: 768px) {
    overflow-y: visible;
  }
`;

type RectProps = Partial<Rectangle> & {
  position: "fixed" | "absolute";
  color: string;
};

const Rect = styled.div.attrs((props: RectProps) => ({
  style: {
    position: props.position,
    left: `${(props.left || 0) * 100}%`,
    top: `${(props.top || 0) * 100}%`,
    width: `${(props.right || 0) * 100 - (props.left || 0) * 100}%`,
    height: `${(props.bottom || 0) * 100 - (props.top || 0) * 100}%`,
  },
}))`
  border: 2px solid ${({ color }: RectProps) => color};
`;

const PreviewRect = styled.div.attrs((props: RectProps) => ({
  style: {
    position: props.position,
    left: `${props.left}px`,
    top: `${props.top}px`,
    width: `${(props.right || 0) - (props.left || 0)}px`,
    height: `${(props.bottom || 0) - (props.top || 0)}px`,
  },
}))`
  border: 2px solid ${({ color }: RectProps) => color};
`;

function fixRect(rect: Rect): Rect {
  const { left, right } =
    rect.left < rect.right
      ? { left: rect.left, right: rect.right }
      : { left: rect.right, right: rect.left };

  const { top, bottom } =
    rect.top < rect.bottom
      ? { top: rect.top, bottom: rect.bottom }
      : { top: rect.bottom, bottom: rect.top };

  return {
    left,
    top,
    right,
    bottom,
  };
}

function positionExtract(event: React.MouseEvent | React.TouchEvent) {
  if (isTouchEvent(event)) {
    const touch = event.touches.item(0);
    if (touch != null) {
      return {
        clientX: touch.clientX,
        clientY: touch.clientY,
        pageX: touch.pageX,
        pageY: touch.pageY,
      };
    } else {
      const changeTouch = event.changedTouches.item(0);
      return {
        clientX: changeTouch.clientX,
        clientY: changeTouch.clientY,
        pageX: changeTouch.pageX,
        pageY: changeTouch.pageY,
      };
    }
  } else {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
    };
  }
}

function isTouchEvent(
  event: React.MouseEvent | React.TouchEvent
): event is React.TouchEvent {
  return "touches" in event;
}
