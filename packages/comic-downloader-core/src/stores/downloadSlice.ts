import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import produce from 'immer'

export enum DOWNLOAD_STATE {
    DOWNLOADING,
    SUCCESS,
    ERROR,
}

export interface Download {
    completeDownloads: number;
    logs: string[];
    downloadStates: DOWNLOAD_STATE[];
}

interface DownloadStatePayload {
    downloadState: DOWNLOAD_STATE;
    index: number;
}

const initialState: Download = {
    completeDownloads: 0,
    logs: [],
    downloadStates: [],
};

export const downloadSlice = createSlice({
    name: 'download',
    initialState: { ...initialState },
    reducers: {
        clearData: (): Download => {
            return { ...initialState };
        },
        incrementCompleteDownloads: (state) => {
            state.completeDownloads += 1;
        },
        addLog: (state, action: PayloadAction<string>) => {
            const log = action.payload;
            state.logs.push(log);
        },
        initDownloadStates: (state, action: PayloadAction<number>) => {
            const size = action.payload;
            
            state.downloadStates = [];
            for (let i = 0; i < size; i++) {
                state.downloadStates.push(DOWNLOAD_STATE.DOWNLOADING);
            }
        },
        setDownloadState: (state, action: PayloadAction<DownloadStatePayload>) => {
            const { downloadState, index } = action.payload;
            state.downloadStates[index] = downloadState;
        },
    },
});