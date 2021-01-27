import { promises as fs, createWriteStream } from 'fs'
import util from 'util'
import http from 'http'
import https from 'https'
import path from 'path'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { LocaleContext } from '../locales/localeContext'
import locales from '../locales'
import { downloadComic } from 'comic-downloader-core'

const streamPipeline = util.promisify(require('stream').pipeline);

interface Params {
    url: string;
    outputDir: string;
}

export default function DownloadInfo() {
    const { url, outputDir } = useParams<Params>();
    
    const [siteName, setSiteName] = useState<string>('');
    const [imageLinks, setImageLinks] = useState<string[]>([]);
    const [finishedDownloads, setFinishedDownloads] = useState<string[]>([]);
    const [logs, setLogs] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState<string>('');

    const startDownload = async () => {
        setErrorMsg('');

        try {
            const decodedUrl = decodeURIComponent(url);
            const res = await downloadComic(decodedUrl);
            setSiteName(res.websiteData.name);
            setImageLinks(res.images);

            for (const imageLink of res.images) {
                const i = res.images.indexOf(imageLink);

                const numberOfDigits = `${res.images.length}`.length; 
                const pageNumber = `${i+1}`.padStart(numberOfDigits, '0');
                let fileName = `${pageNumber}`;
                const fileExtension = imageLink.split('.').pop();
                if (fileExtension && fileExtension.length > 0) {
                    fileName = `${pageNumber}.${fileExtension}`;
                }

                const decodedOutputDir = decodeURIComponent(outputDir);
                const fullPath = path.join(decodedOutputDir, fileName);
                downloadFile(imageLink, fullPath)
                    .then(() => {
                        const log = `Page ${i+1} saved as ${fullPath}`;
                        console.log(log);
                        
                        // add log to logs array
                        setLogs([
                            ...logs,
                            log,
                        ]);
        
                        setFinishedDownloads([
                            ...finishedDownloads,
                            imageLink,
                        ]);
                    })
                    .catch(e => {
                        console.warn(e);
        
                        setLogs([
                            ...logs,
                            String(e),
                        ]);
        
                        setFinishedDownloads([
                            ...finishedDownloads,
                            imageLink,
                        ]);
                    });
            }
        }
        catch (e) {
            setErrorMsg('Error')
        }
    };

    useEffect(() => {
        console.log('url ' + url);
        console.log('dir ' + outputDir);

        startDownload();
    }, []);
    
    return (
        <LocaleContext.Consumer>
            {({ locale }) => {
                const messages = locales[locale];
                
                return (
                    <>
                        <p>Url: {decodeURIComponent(url)}</p>
                        <p>Dir: {decodeURIComponent(outputDir)}</p>
                        <h3>{errorMsg}</h3>
                    </>
                );
            }}
        </LocaleContext.Consumer>
    );
}

async function downloadFile(url: string, fileName: string) {
    const stream = createWriteStream(fileName);
    const response = await request(url);
    response.pipe(stream);
}

async function request(url: string): Promise<http.IncomingMessage> {
    const protocol = url.startsWith('https://') ? https : http;

    return new Promise ((resolve, reject) => {
        const request = protocol.get(url)
            .on('response', (response) => resolve(response))
            .on('error', (e) => reject(e.message));
    });
}