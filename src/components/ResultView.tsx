import React, { useCallback } from "react";
import styled from "styled-components";
import Loading from "./Loading";
import ProgressBar from "./ProgressBar";

type Props = {
  isComplete: boolean;
  progress: number;
  text: string;
  onClick?: (text: string) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

export default (props: Props) => {
  const onClick = useCallback(() => {
    if (props.onClick == null || !props.isComplete) {
      return;
    }

    props.onClick(props.text);
  }, [props.text, props.isComplete]);

  return (
    <Container
      title={!props.isComplete ? "解析中…" : "クリックでコピー"}
      onClick={onClick}
      onMouseLeave={props.onMouseLeave}
      onMouseEnter={props.onMouseEnter}
    >
      {props.isComplete ? (
        <>{props.text}</>
      ) : (
        <>
          <Loading />
          <ProgressBar percentOf0To1={props.progress} />
        </>
      )}
    </Container>
  );
};

const Container = styled.div`
  user-select: none;
  min-height: 50px;
  font-size: 10px;
  padding: 3px;
  margin-bottom: 3px;
  background-color: #777;
  box-shadow: 0 0 0 1px #222;
  margin: 2px 2px 4px 2px;
  :hover {
    background-color: #aaa;
    transition: color 0.3;
  }
`;
