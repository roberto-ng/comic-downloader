import { configureStore } from '@reduxjs/toolkit'
import { combineReducers } from 'redux'
import { chapterSlice, Chapter } from './chapterSlice'
import { downloadSlice, Download } from './downloadSlice'

export interface StoreState {
    chapter: Chapter;
    download: Download;
};

export const store = configureStore({
    reducer: combineReducers({
        chapter: chapterSlice.reducer,
        download: downloadSlice.reducer,
    }),
});