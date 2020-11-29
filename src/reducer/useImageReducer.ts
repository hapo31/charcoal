import { useReducer } from "react";
import Rectangle from "../domain/Recrangle";

export type ImageState = {
  rectangles: Rectangle[];
  fileType: "image" | "pdf";
};

export const initialState: ImageState = {
  rectangles: [],
  fileType: "image"
};

type Actions = ReturnType<
  | typeof AddRect
>;
const ADD_RECT = "ADD_RECT" as const;
export const AddRect = (rect: Rectangle) => ({ type: ADD_RECT, rect });

function reducer(state: ImageState = initialState, action: Actions): ImageState {
  switch (action.type) {
    case ADD_RECT: {
      return { ...state, rectangles: [...state.rectangles, action.rect] };
    }

    default:
      return state;
  }
}

export const useImageReducer = (initialState_: ImageState = initialState) => {
  return useReducer<typeof reducer, ImageState>(
    reducer,
    initialState_,
    undefined as any
  );
};
