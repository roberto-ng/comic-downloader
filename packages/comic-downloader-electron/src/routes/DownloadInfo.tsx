import { promises as fs, createWriteStream } from 'fs'
import http from 'http'
import https from 'https'
import path from 'path'
import React, { useContext, useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import styled from 'styled-components'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import Typography from '@material-ui/core/Typography'
import { Button, LinearProgress } from '@material-ui/core'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { downloadComic, WebsiteIsNotSupported } from 'comic-downloader-core'
import { localeContext, getValidLocale } from '../locales/localeContext'
import { chapterContext } from '../ChapterContext'
import locales from '../locales'

const { app } = require('electron').remote;

interface Params {
    encodedUrl: string;
    encodedOutputDir: string;
}

enum DOWNLOAD_STATE {
    DOWNLOADING,
    SUCCESS,
    ERROR,
}

export default function DownloadInfo() {
    const { encodedUrl, encodedOutputDir } = useParams<Params>();
    const { locale } = useContext(localeContext);
    const { chapterName } = useContext(chapterContext);
    
    const [url, setUrl] = useState<string>('');
    const [outputDir, setOutputDir] = useState<string>('');
    const [siteName, setSiteName] = useState<string>('');
    const [imageLinks, setImageLinks] = useState<string[]>([]);
    const [downloadStates, setDownloadStates] = useState<DOWNLOAD_STATE[]>([]);
    const [areAllDownloadsComplete, setAreAllDownloadsComplete] = useState<boolean>(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [completeDownloadsNumber, setCompleteDownloadsNumber] = useState<number>(0);
    const [isWebsiteSupported, setIsWebsiteSupported] = useState<boolean>(true);

    const refLogContainer = useRef<HTMLDivElement>(null);

    const startDownload = async () => {
        setErrorMsg('');
        const messages = locales[locale];
        let namePrefix = chapterName.trim().replace(' ', '_');
        if (namePrefix.length > 0) {
            namePrefix = `${namePrefix}-`
        }
        
        try {
            let decodedUrl = decodeURIComponent(encodedUrl);
            const decodedOutputDir = decodeURIComponent(encodedOutputDir);

            if (!decodedUrl.startsWith('http')) {
                decodedUrl = `http://${decodedUrl}`;
            }
            
            const res = await downloadComic(decodedUrl);
            setSiteName(res.websiteData.name);
            setImageLinks(res.images);
            setIsWebsiteSupported(true);
            
            let localCompleteDownloads = 0; 
            const localLogs: string[] = new Array();
            const localDownloadStates: DOWNLOAD_STATE[] = new Array(res.images.length);
            for (let i = 0; i < localDownloadStates.length; i++) {
                localDownloadStates[i] = DOWNLOAD_STATE.DOWNLOADING;
            }

            for (const imageLink of res.images) {
                const i = res.images.indexOf(imageLink);

                const numberOfDigits = String(res.images.length).length; 
                const pageNumber = `${i+1}`.padStart(numberOfDigits, '0');
                let fileName = `${namePrefix}${pageNumber}`;
                const fileExtension = imageLink.split('.').pop();
                if (fileExtension && fileExtension.length > 0) {
                    fileName = `${namePrefix}${pageNumber}.${fileExtension}`;
                }

                const fullPath = path.join(decodedOutputDir, fileName);
                downloadFile(imageLink, fullPath)
                    .then((url) => {
                        const index = res.images.indexOf(url);

                        const log = messages.pageDownloadedSuccessfully
                            .replace('{fileName}', fileName);
                        
                        localLogs.push(log);
                        setLogs([
                            ...localLogs,
                        ]);
                        
                        localDownloadStates[index] = DOWNLOAD_STATE.SUCCESS;
                        setDownloadStates([
                            ...localDownloadStates,
                        ]);

                        localCompleteDownloads += 1;
                        setCompleteDownloadsNumber(localCompleteDownloads);
                    })
                    .catch(([url, e]) => {
                        const index = res.images.indexOf(url);

                        console.warn(e);
        
                        localLogs.push(String(e));
                        setLogs([
                            ...localLogs,
                        ]);

                        localDownloadStates[index] = DOWNLOAD_STATE.ERROR;
                        setDownloadStates([
                            ...localDownloadStates,
                        ]);

                        localCompleteDownloads += 1;
                        setCompleteDownloadsNumber(localCompleteDownloads);
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
        setUrl(decodeURIComponent(encodedUrl))
        setOutputDir(decodeURIComponent(encodedOutputDir));

        startDownload();
    }, []);

    useEffect(() => {
        // checks if all pages have been downloaded
        if (downloadStates.length === 0) {
            return;
        }
        
        let isFinished = true;
        for (const downloadState of downloadStates) {
            if (downloadState === DOWNLOAD_STATE.DOWNLOADING) {
                isFinished = false;
            }
        }

        setAreAllDownloadsComplete(isFinished);
    }, [downloadStates]);

    useEffect(() => {
        // scroll down when there is a new log
        if (refLogContainer === null || logs.length === 0) {
            return;
        }

        const logContainer = refLogContainer.current;
        logContainer.scrollTop = logContainer.scrollHeight;
    }, [logs])
    
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

    const progress = (100 * completeDownloadsNumber) / imageLinks.length;

    return (
        <>            
            {(imageLinks.length > 0) ? (
                <ProgressContainer>
                    <Typography>
                        {messages.downloadingChapterFrom.replace('{siteName}', siteName)}
                    </Typography>
                    <Typography>
                        {completeDownloadsNumber}/{imageLinks.length}
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
                            {logs.map((log, i) => (
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
            .on('error', (e) => reject([url, e.message]));
    });
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