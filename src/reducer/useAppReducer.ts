import { useReducer } from "react";
import Rectangle from "../domain/Recrangle";

type OCRResult = {
  text: string;
  jobId: string;
  progress: number;
  isCompleted: boolean;
};

export type AppState = {
  imageSrc: string | null;
  rectangles: Rectangle[];
  ocrResults: OCRResult[];
};

type Actions = ReturnType<
  | typeof ImageLoaded
  | typeof AddRect
  | typeof StartJob
  | typeof UpdateProgress
  | typeof JobError
  | typeof JobComplete
  | typeof AddResult
>;

const IMAGE_LOADED = "IMAGE_LOADED" as const;
export const ImageLoaded = (src: string) => ({ type: IMAGE_LOADED, src });

const ADD_RECT = "ADD_RECT" as const;
export const AddRect = (rect: Rectangle) => ({ type: ADD_RECT, rect });

const START_JOB = "START_JOB" as const;
export const StartJob = (jobId: string) => ({ type: START_JOB, jobId });

const UPDATE_PROGRESS = "UPDATE_PROGRESS" as const;
export const UpdateProgress = (jobId: string, progress: number) => ({
  type: UPDATE_PROGRESS,
  jobId,
  progress,
});

const JOB_ERROR = "JOB_ERROR" as const;
export const JobError = (jobId: string) => ({ type: JOB_ERROR, jobId });

const JOB_COMPLETE = "JOB_COMPLETE" as const;
export const JobComplete = (jobId: string, text: string) => ({
  type: JOB_COMPLETE,
  jobId,
  text,
});

const ADD_RESULT = "ADD_RESULT" as const;
export const AddResult = (ocrResult: OCRResult) => ({
  type: ADD_RESULT,
  ocrResult,
});

function reducer(state: AppState, action: Actions): AppState {
  switch (action.type) {
    case IMAGE_LOADED: {
      return { ...state, imageSrc: action.src };
    }

    case ADD_RECT: {
      return { ...state, rectangles: [...state.rectangles, action.rect] };
    }

    case START_JOB: {
      return {
        ...state,
        ocrResults: [
          ...state.ocrResults,
          {
            jobId: action.jobId,
            isCompleted: false,
            progress: 0,
            text: "",
          },
        ],
      };
    }

    case UPDATE_PROGRESS: {
      const index = state.ocrResults.findIndex(r => r.jobId === action.jobId);
      if (index === -1) {
        return state;
      }
      state.ocrResults[index].progress = action.progress;

      return { ...state, ocrResults: [...state.ocrResults] };
    }

    case JOB_ERROR: {
      const index = state.ocrResults.findIndex(r => r.jobId === action.jobId);
      state.ocrResults.splice(index, 1);
      return { ...state, ocrResults: [...state.ocrResults] };
    }

    case JOB_COMPLETE: {
      const index = state.ocrResults.findIndex(r => r.jobId === action.jobId);
      state.ocrResults[index].text = action.text;
      state.ocrResults[index].isCompleted = true;
      return { ...state, ocrResults: [...state.ocrResults] };
    }

    case ADD_RESULT: {
      return { ...state, ocrResults: [...state.ocrResults, action.ocrResult] };
    }

    default:
      return state;
  }
}

export const useAppReducer = (initialState: AppState) => {
  return useReducer<typeof reducer, AppState>(
    reducer,
    initialState,
    undefined as any
  );
};
