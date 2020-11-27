import React from "react";
import styled, { CSSProperties } from "styled-components";

type Props = {
  percentOf0To1: number;
  color: string;
};

export default (props: Props) => (
  <Container>
    <Bar percent={props.percentOf0To1} color={props.color} />
  </Container>
);

type StyledProps = {
  percent: number;
  color: string;
  style?: CSSProperties;
};

const Container = styled.span`
  display: inline-block;
  box-shadow: 0 0 0 2px gray;
  padding: 2px;
  margin-right: 2px;
  width: 98%;
  height: 30px;
`;

const Bar = styled.div.attrs((props: StyledProps) => ({
  style: {
    ...props.style,
    width: `calc(100% - ${Math.floor((1.0 - props.percent) * 100)}%)`,
  },
}))`
  height: 100%;
  background-color: ${({ color }: StyledProps) => color};
`;
