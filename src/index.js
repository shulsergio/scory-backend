import { initMongoDB } from './db/initMongoDB.js';
import { setupServer } from './server.js';

const bootstrap = async () => {
  console.log('bootstrap called');
  await initMongoDB();
  console.log('called setupServer after bootstrap');
  setupServer();
  console.log('setupServer IS OK');
};

bootstrap();
