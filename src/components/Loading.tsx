import React from "react";
import styled from "styled-components";

export default () => (
  <Spinner>
    <Rect delay={-1.1} />
    <Rect delay={-1.0} />
    <Rect delay={-0.9} />
    <Rect delay={-0.8} />
    <Rect delay={-0.7} />
  </Spinner>
);

const Spinner = styled.div`
  margin: 5px auto;
  width: 50px;
  max-height: 20px;
  text-align: center;
  font-size: 10px;
`;

const Rect = styled.div`
  margin: 0 1px 0;
  background-color: blue;
  height: 20px;
  width: 6px;
  display: inline-block;
  animation: sk-stretchdelay 1.2s infinite ease-in-out;
  animation-delay: ${({ delay }: { delay: number }) => `${delay}s`};

  @keyframes sk-stretchdelay {
    0%,
    40%,
    100% {
      transform: scaleY(0.4);
    }
    20% {
      transform: scaleY(1);
    }
  }
`;
