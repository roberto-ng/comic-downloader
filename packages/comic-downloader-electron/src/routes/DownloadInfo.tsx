import React, { useContext, useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { promises as fs, createWriteStream } from 'fs'
import http from 'http'
import https from 'https'
import path from 'path'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import { Button, LinearProgress } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { downloadComic, WebsiteIsNotSupported } from 'comic-downloader-core'
import { localeContext } from '../locales/localeContext'
import locales from '../locales'
import { downloadSlice, DOWNLOAD_STATE, StoreState } from 'comic-downloader-core'

const { app } = require('electron').remote;

interface Params {
    encodedUrl: string;
    encodedOutputDir: string;
}

export default function DownloadInfo() {
    const dispatch = useDispatch();
    const state = useSelector((state: StoreState) => state);
    const { locale } = useContext(localeContext);
    
    const [siteName, setSiteName] = useState<string>('');
    const [imageLinks, setImageLinks] = useState<string[]>([]);
    const [areAllDownloadsComplete, setAreAllDownloadsComplete] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [isWebsiteSupported, setIsWebsiteSupported] = useState<boolean>(true);

    const refLogContainer = useRef<HTMLDivElement>(null);

    const startDownload = async () => {
        const messages = locales[locale];
        setErrorMsg('');
        
        try {
            let namePrefix = replaceAll(state.chapter.chapterName.trim(), ' ', '_');
            if (namePrefix.length > 0) {
                namePrefix = `${namePrefix}-`
            }
            
            let pageUrl = state.chapter.url.trim();
            if (!pageUrl.startsWith('http')) {
                pageUrl = `http://${pageUrl}`;
            }
            
            const res = await downloadComic(pageUrl);
            setSiteName(res.websiteData.name);
            setImageLinks(res.images);
            setIsWebsiteSupported(true);

            dispatch(downloadSlice.actions.initDownloadStates(res.images.length));;

            for (const imageLink of res.images) {
                const i = res.images.indexOf(imageLink);

                const numberOfDigits = String(res.images.length).length; 
                const pageNumber = `${i+1}`.padStart(numberOfDigits, '0');
                let fileName = `${namePrefix}${pageNumber}`;
                const fileExtension = imageLink.split('.').pop();
                if (fileExtension && fileExtension.length > 0) {
                    fileName = `${namePrefix}${pageNumber}.${fileExtension}`;
                }

                const fullPath = path.join(state.chapter.outputDir, fileName);
                downloadFile(imageLink, fullPath)
                    .then(() => {
                        const index = res.images.indexOf(imageLink);

                        const log = messages.pageDownloadedSuccessfully
                            .replace('{fileName}', fileName);
                        
                        dispatch(downloadSlice.actions.addLog(log));

                        dispatch(downloadSlice.actions.setDownloadState({
                            index,
                            downloadState: DOWNLOAD_STATE.SUCCESS,
                        }));

                        dispatch(downloadSlice.actions.incrementCompleteDownloads());
                    })
                    .catch((e) => {
                        const index = res.images.indexOf(imageLink);

                        console.warn(e);
        
                        dispatch(downloadSlice.actions.addLog(String(e)));

                        dispatch(downloadSlice.actions.setDownloadState({
                            index,
                            downloadState: DOWNLOAD_STATE.ERROR,
                        }));

                        dispatch(downloadSlice.actions.incrementCompleteDownloads());
                    });
            }
        }
        catch (e) {
            if (e instanceof WebsiteIsNotSupported) {
                setIsWebsiteSupported(false);
            }

            setErrorMsg(String(e));
        }
    };

    useEffect(() => {
        startDownload();

        return () => {
            dispatch(downloadSlice.actions.clearData());
        };
    }, []);

    useEffect(() => {
        // checks if all pages have been downloaded
        if (state.download.downloadStates.length === 0) {
            return;
        }
        
        let isFinished = true;
        for (const downloadState of state.download.downloadStates) {
            if (downloadState === DOWNLOAD_STATE.DOWNLOADING) {
                isFinished = false;
            }
        }

        setAreAllDownloadsComplete(isFinished);
    }, [state.download.downloadStates]);

    useEffect(() => {
        // scroll down when there is a new log
        if (refLogContainer === null || state.download.logs.length === 0) {
            return;
        }

        const logContainer = refLogContainer.current;
        logContainer.scrollTop = logContainer.scrollHeight;
    }, [state.download.logs])
    
    const messages = locales[locale];

    if (errorMsg.trim().length > 0) {
        // show error message
        return (
            <div style={{ 
                textAlign: 'center',
                marginTop: '20px',
            }}>
                {(!isWebsiteSupported) ? (
                    <Typography>
                        {messages.websiteNotSupported}
                    </Typography>
                ) : (
                    <Typography>{errorMsg}</Typography>
                )}

                <Link to="/">
                    <Button 
                        variant="contained"
                        color="primary"
                    >
                        {messages.goBack}
                    </Button>
                </Link>
            </div>
        );
    }

    const progress = (100 * state.download.completeDownloads) / imageLinks.length;

    return (
        <>            
            {(imageLinks.length > 0) ? (
                <ProgressContainer>
                    <Typography>
                        {messages.downloadingChapterFrom.replace('{siteName}', siteName)}
                    </Typography>
                    <Typography>
                        {state.download.completeDownloads}/{imageLinks.length}
                    </Typography>
                    <div className="progress-bar">
                        <LinearProgress 
                            variant="determinate"
                            color="primary" 
                            value={progress}
                        />
                    </div>
                </ProgressContainer>
            ) : (
                <ProgressContainer>
                    <Typography style={{ textAlign: 'center' }}>
                        Fetching chapter data...
                    </Typography>
                </ProgressContainer>
            )}
            
            <AccordionContainer>
                <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                    <Typography>Details</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <DetailsContents ref={refLogContainer}>
                            {state.download.logs.map((log, i) => (
                                <Typography key={i}>
                                    {log}
                                </Typography>
                            ))}
                        </DetailsContents>
                    </AccordionDetails>
                </Accordion>
            </AccordionContainer> 

            {(areAllDownloadsComplete) && (
                <div style={{ textAlign: 'center' }}>
                    <Link to="/">
                        <Button 
                            variant="contained"
                            color="primary"
                        >
                            {messages.goBack}
                        </Button>
                    </Link>
                </div>
            )}

            {(errorMsg.trim().length > 0 && !areAllDownloadsComplete) && (
                <Link to="/">{messages.goBack}</Link>
            )}
        </>
    );
}

async function downloadFile(url: string, fileName: string): Promise<string> {
    const stream = createWriteStream(fileName);
    const response = await request(url);
    response.pipe(stream);    
    return url;
}

async function request(url: string): Promise<http.IncomingMessage> {
    const protocol = url.startsWith('https://') ? https : http;

    return new Promise ((resolve, reject) => {
        protocol.get(url)
            .on('response', (response) => resolve(response))
            .on('error', (e) => reject(e));
    });
}

function replaceAll(str: string, find: string, replace: string): string {
    return str.split(find).join(replace);
}

const ProgressContainer = styled.div`
    text-align: center;

    .progress-bar {
        margin-left: 30px;
        margin-right: 30px;
    }

    p {
        margin-top: 30px;
        font-size: 18px;
    }
`;

const DetailsContents = styled.div`
    max-height: 250px;
    overflow-y: scroll;
    width: 100%;
`;

const AccordionContainer = styled.div`
    margin: 30px;
`;