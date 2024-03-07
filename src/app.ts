import express, { Express, Request, Response } from 'express';
import router from './route';

const app: Express = express();
const port = process.env.PORT || 3000;

app.use('/', router);

export const listener = app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

listener.on('error', (error: Error) => {
  console.error('Error starting server:', error);
});


