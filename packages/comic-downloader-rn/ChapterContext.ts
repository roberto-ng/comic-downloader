import { Context, createContext } from 'react'

export interface ChapterContext {
    url: string;
    chapterName: string;
    outputDir: string;
    
    changeUrl: (url: string) => void;
    changeChapterName: (name: string) => void;
    changeOutputDir: (dir: string) => void;
}

export const chapterContext = createContext<ChapterContext|null>(null);