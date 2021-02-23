import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Chapter {
    url: string;
    chapterName: string;
    outputDir: string;
    albumName: string;
}

const initialState: Chapter = {
    url: '',
    chapterName: '',
    outputDir: '',
    albumName: '',
};

export const chapterSlice = createSlice({
    name: 'chapter',
    initialState: initialState, 
    reducers: {
        setUrl: (state, action: PayloadAction<string>) => {
            state.url = action.payload;
        },
        setName: (state, action: PayloadAction<string>) => {
            state.chapterName = action.payload;
        },
        setOuputDir: (state, action: PayloadAction<string>) => {
            state.outputDir = action.payload;
        },
        setAlbumName: (state, action: PayloadAction<string>) => {
            state.albumName = action.payload;
        },
    },
});