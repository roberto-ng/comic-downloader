import { Context, createContext } from 'react'

export interface ChapterContext {
    url: string;
    chapterName: string;
    albumName: string;
    
    changeUrl: (url: string) => void;
    changeChapterName: (name: string) => void;
    changeAlbumName: (name: string) => void;
}

export const chapterContext = createContext<ChapterContext|null>(null);