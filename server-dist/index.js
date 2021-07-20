import * as path from "path";
import { fileURLToPath } from "url";
import express from "express";
import http from "http";
import { ExpressPeerServer } from "peer";
const app = express();
const PORT = process.env.PORT || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "..", "build")));
// app.use((req, res, next) => {
//     res.sendFile(path.join(__dirname, '..', 'build', 'index.html'));
// });
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
});
const server = http.createServer(app);
const peerServer = ExpressPeerServer(server);
app.use("/peerjs", peerServer);
server.listen(PORT, () => {
    console.log(`server started on port ${PORT}`);
});
