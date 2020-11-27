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

  const onChangeValue = useCallback((event: React.ChangeEvent) => {
    const input = event.target as HTMLInputElement;
    props.onChangePage(parseInt(input.value));
  }, []);

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
        onChange={onChangeValue}
        defaultValue={props.pageNum}
        disabled={props.disabled}
        type="number"
      />{" "}
      / <Input value={props.maxPage} disabled />
      <Button onClick={onClickPlus} disabled={props.disabled}>
        +
      </Button>
    </Container>
  );
};

const Container = styled.div``;

const Button = styled.button``;

const Input = styled.input``;
