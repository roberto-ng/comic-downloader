export { 
    detectWebsite, 
    WebsiteIsNotSupported,
} from './WebsiteData';

export {
    downloadWebpage, 
    downloadComic,
} from './downloadComic';

export type {
    StoreState,
} from './stores';

export {
    store,
} from './stores';

export type {
    Chapter
} from './stores/chapterSlice';

export {
    chapterSlice,
} from './stores/chapterSlice';

export type {
    Download,
} from './stores/downloadSlice';

export {
    DOWNLOAD_STATE,
    downloadSlice,
} from './stores/downloadSlice';