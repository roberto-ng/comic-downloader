import { promises as fs, createWriteStream } from 'fs'
import http from 'http'
import https from 'https'
import path from 'path'
import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { downloadComic } from 'comic-downloader-core'
import { LocaleContext, getValidLocale } from '../locales/localeContext'
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
    const { locale } = useContext(LocaleContext);
    
    const [url, setUrl] = useState<string>('');
    const [outputDir, setOutputDir] = useState<string>('');
    const [siteName, setSiteName] = useState<string>('');
    const [imageLinks, setImageLinks] = useState<string[]>([]);
    const [downloadStates, setDownloadStates] = useState<DOWNLOAD_STATE[]>([]);
    const [areAllDownloadsComplete, setAreAllDownloadsComplete] = useState<boolean>(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');

    const startDownload = async () => {
        setErrorMsg('');
        const messages = locales[locale];
        
        try {
            const decodedUrl = decodeURIComponent(encodedUrl);
            const decodedOutputDir = decodeURIComponent(encodedOutputDir);
            
            const res = await downloadComic(decodedUrl);
            setSiteName(res.websiteData.name);
            setImageLinks(res.images);
            
            const localLogs: string[] = new Array();
            const localDownloadStates: DOWNLOAD_STATE[] = new Array(res.images.length);
            for (let i = 0; i < localDownloadStates.length; i++) {
                localDownloadStates[i] = DOWNLOAD_STATE.DOWNLOADING;
            }

            for (const imageLink of res.images) {
                const i = res.images.indexOf(imageLink);

                const numberOfDigits = String(res.images.length).length; 
                const pageNumber = `${i+1}`.padStart(numberOfDigits, '0');
                let fileName = `${pageNumber}`;
                const fileExtension = imageLink.split('.').pop();
                if (fileExtension && fileExtension.length > 0) {
                    fileName = `${pageNumber}.${fileExtension}`;
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
                    });
            }
        }
        catch (e) {
            setErrorMsg(String(e))
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
        const numberOfPages = imageLinks.length;
        for (const downloadState of downloadStates) {
            if (downloadState === DOWNLOAD_STATE.DOWNLOADING) {
                isFinished = false;
            }
        }

        setAreAllDownloadsComplete(isFinished);
    }, [downloadStates])
    
    const messages = locales[locale];

    return (
        <>
            <p>Url: {decodeURIComponent(url)}</p>
            <p>Dir: {decodeURIComponent(outputDir)}</p>
            <h3>{errorMsg}</h3>
            
            <div 
                className="logs-container"
                style={{ 
                    overflowY: 'scroll',
                    backgroundColor: 'black',
                    color: 'white', 
                    height: '300px'
                }}
            >
                {logs.map((log, i) => (
                    <p key={i}>{log}</p>
                ))}
            </div>
            
            {(areAllDownloadsComplete) && (
                <p>Finished!!</p>
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