import React from "react";
import styled, { CSSProperties } from "styled-components";

type Props = {
  percentOf0To1: number;
  color: string;
  barStyle?: CSSProperties;
};

export default (props: Props) => (
  <Container>
    <Bar percent={props.percentOf0To1}
      color={props.color}
      style={props.barStyle} />
  </Container> 
);

type StyledProps = {
  percent: number;
  color: string;
}

const Container = styled.span`
  display: inline-block;
  border: 2px solid gray;
  padding: 2px;
  width: 100%;
  height: 30px;
`;

const Bar = styled.div`
  height: 100%;
  width: calc(100% - ${({percent}: StyledProps) => `${Math.floor((1.0 - percent) * 100) }%`});
  background-color: ${({color}: StyledProps) => color};
`;