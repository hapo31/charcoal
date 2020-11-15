import React from "react";
import styled from "styled-components";
import Loading from "./Loading";
import ProgressBar from "./ProgressBar";

type Props = {
  isComplete: boolean;
  progress: number;
  text: string;
  onClick?: () => void;
};

export default (props: Props) => (
  <Container onClick={props.onClick}>
    { props.isComplete ? props.text : <>
      <Loading />
      <ProgressBar color="#25f" percentOf0To1={props.progress} />
    </>}
  </Container>
);

const Container = styled.div`
  min-height: 50px;
  font-size: 10px;
  padding: 3px;
  margin-bottom: 3px;
  background-color: #7af;
  box-shadow: 0 0 0 1px #25f;
  margin: 2px 2px 4px 2px;
  :hover {
    transition: color .3;
  }
`;
