import { useReducer } from "react";
import Rectangle from "../../domain/Recrangle";

export type AppState = { 
  imageSrc: string | null;
  rectangles: Rectangle[];
  resultTexts: string[];
  progress: number;
  status: string;
};

type Actions = ReturnType<
  typeof ImageLoaded
| typeof AddRect
| typeof SetProgress
| typeof SetStatus
| typeof AddResult
>;

const IMAGE_LOADED = "IMAGE_LOADED" as const;
export const ImageLoaded = (src: string) => ({ type: IMAGE_LOADED, src });

const ADD_RECT = "ADD_RECT" as const;
export const AddRect = (rect: Rectangle) => ({ type: ADD_RECT, rect });

const SET_PROGRESS = "SET_PROGRESS" as const;
export const SetProgress = (progress: number) => ({ type: SET_PROGRESS, progress });

const SET_STATUS = "SET_STATUS" as const;
export const SetStatus = (status: string) => ({ type: SET_STATUS, status });

const ADD_RESULT = "ADD_RESULT" as const;
export const AddResult = (resultText: string) => ({ type: ADD_RESULT, resultText });

function reducer(state: AppState, action: Actions): AppState {
  switch(action.type) {
    case IMAGE_LOADED: {
      return {...state,  imageSrc: action.src};
    }

    case ADD_RECT: {
      return { ...state, rectangles: [ ...state.rectangles, action.rect ] };
    }

    case SET_PROGRESS: {
      return { ...state, progress: action.progress };
    }

    case SET_STATUS: {
      return { ...state, status: action.status };
    }

    case ADD_RESULT: {
      return { ...state, resultTexts: [...state.resultTexts, action.resultText] };
    }

    default: 
      return state;
  }
}

export const useAppReducer = (initialState: AppState) => {
  return useReducer<typeof reducer, AppState>(reducer, initialState, undefined as any);
};