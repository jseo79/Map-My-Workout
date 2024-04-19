import * as activity from './public/activities.js';

import express from 'express';
const app = express();
import path from 'path';
const port = 8000;

const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
	console.log(`Now listening on port ${port}`);
});
