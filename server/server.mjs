import path from 'path';
import express from 'express';
import gzipStatic from 'connect-gzip-static';
import http from 'http';

const httpApp = express();

const staticPath = path.resolve('./dist');
httpApp.use('/', gzipStatic(staticPath));
httpApp.use('/*', gzipStatic(staticPath));

const httpServer = http.createServer(httpApp);

export default httpServer;
