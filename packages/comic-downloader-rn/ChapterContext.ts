import { Context, createContext } from 'react'

export interface ChapterContext {
    url: string;
    chapterName: string;
    
    changeUrl: (url: string) => void;
    changeChapterName: (name: string) => void;
}

export const chapterContext = createContext<ChapterContext|null>(null);