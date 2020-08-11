import express from 'express';
import morgan from 'morgan';
import { json, urlencoded } from 'body-parser';
import { PORT } from './config';
import { router } from './views';

const app = express();

app.use(json());
app.use(morgan(`:remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length]`));
app.use(urlencoded({ extended: true }));
app.use('/', router);

app.listen(PORT, () => {
  console.log('Listening on', PORT);
  console.log('version', '3.0.0');
});
