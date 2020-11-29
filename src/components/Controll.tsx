import React, { useCallback, useEffect, useRef } from "react";
import styled from "styled-components";

type Props = {
  pageNum: number;
  maxPage: number;
  disabled?: boolean;
  onClickPlusButton: (nextValue: number) => void;
  onClickMinusButton: (nextValue: number) => void;
  onChangePage: (value: number) => void;
};

export default (props: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const onClickPlus = useCallback(() => {
    if (props.pageNum < props.maxPage) {
      props.onClickPlusButton(props.pageNum + 1);
    } else {
      props.onClickPlusButton(props.pageNum);
    }
  }, [props.pageNum, props.maxPage]);

  const onClickMinus = useCallback(() => {
    if (props.pageNum > 1) {
      props.onClickMinusButton(props.pageNum - 1);
    } else {
      props.onClickMinusButton(props.pageNum);
    }
  }, [props.pageNum, props.maxPage]);

  const onKeyPress = useCallback(
    (event: React.KeyboardEvent) => {
      const input = event.target as HTMLInputElement;
      switch (event.key) {
        case "Enter": {
          const value = parseInt(input.value);
          if (value <= 0) {
            props.onChangePage(1);
          } else if (value > props.maxPage) {
            props.onChangePage(props.maxPage);
          } else {
            props.onChangePage(value);
          }
        }
      }
    },
    [props.maxPage]
  );

  useEffect(() => {
    if (inputRef.current == null) {
      return;
    }
    inputRef.current.value = props.pageNum.toString();
  }, [props.pageNum]);

  return (
    <Container>
      <Button onClick={onClickMinus} disabled={props.disabled}>
        -
      </Button>
      <Input
        ref={inputRef}
        onKeyPress={onKeyPress}
        defaultValue={props.pageNum}
        disabled={props.disabled}
        type="number"
      />
      <Divider>/</Divider>
      <Input value={props.maxPage} disabled />
      <Button onClick={onClickPlus} disabled={props.disabled}>
        +
      </Button>
    </Container>
  );
};

const Container = styled.div`
  user-select: none;
  width: 100%;
  text-align: center;
  background-color: rgba(200, 200, 200, 0.8);
  position: fixed;
  bottom: 0;
`;

const Button = styled.button`
  height: 30px;
  width: 30px;
  size: 24px;
  font-weight: bold;
  border: 2px gray solid;
`;

const Input = styled.input`
  size: 24px;
  font-weight: bold;
  height: 24px;
  width: 30px;
`;

const Divider = styled.span`
  display: inline-block;
  margin: 0 4px 0;
  size: 24px;
  color: #ddd;
  font-weight: bold;
`;
