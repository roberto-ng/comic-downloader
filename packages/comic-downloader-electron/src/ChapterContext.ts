import { Context, createContext } from 'react'

interface ChapterContext {
    url: string;
    outputDir: string;
    
    changeUrl: (url: string) => void;
    changeOutputDir: (dir: string) => void;
}

export const chapterContext: Context<ChapterContext> = createContext(null);