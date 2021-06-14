import * as path from 'path';
import {fileURLToPath} from 'url';
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.static(path.join(__dirname, '..', 'build')));
//app.use(express.static("../public"));

app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
});

app.get('/works', (req, res) => {
    res.send('Works');
});

app.listen(PORT, () => {
    console.log('server started on port 5000');
});