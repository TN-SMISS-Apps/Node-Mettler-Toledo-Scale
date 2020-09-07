import express from 'express';
import morgan from 'morgan';
import { json, urlencoded } from 'body-parser';
import { router } from './views';
import multer from 'multer';

export const app = express();

app.use(json());
app.use(morgan(`:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]`));
app.use(urlencoded({ extended: true }));
app.use(multer().any());
app.use('/', router);
