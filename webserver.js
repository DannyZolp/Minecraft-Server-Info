const mcquery = require("minecraft-query");
const fs = require("fs");
const axios = require("axios");
const path = require("path");
const express = require("express");
require('dotenv').config();

const ServerQuery = new mcquery({ host: process.env.MINECRAFT_URL, port: process.env.MINECRAFT_PORT, timeout: 7500 });

const port = process.env.PORT;
const app = express();

app.set("views", path.join(__dirname, "templates"));
app.set("view engine", "pug");

ServerQuery.fullStat().then((res) => {
    StartServerRender();
}).catch((err) => {
    StartErrorRender(err);
})

function StartServerRender() {
    app.get("/", (req, res) => {
        GetUpdate((data) => {
            res.render("index", {
                title: "Home",
                server: {
                    version: data.version,
                    players: {
                        online: data.online_players,
                        max: data.max_players,
                        list: data.players
                    }
                },
                discord: {
                    serverId: process.env.DISCORD_WIDGET_ID
                }
            });
        });
    });
    StartExpress();
}

function StartErrorRender(err) {
    app.get("/", (req, res) => {
        res.render("error", {
            title: "Error",
            server: {
                error: {
                    understandable: "Unable to Connect to Minecraft Server",
                    problem: err
                }
            }
        });
    });
    StartExpress();
}

function StartExpress() {
    AddAPIListeners(() => {
        app.listen(port, () => {
            console.log(`Started Express on ${port}`);
        });
    });
}

function AddAPIListeners(callback) {
    app.post("/api/v1/world-download", (req, res) => {
        GetWorldFile(() => {
            res.sendFile(path.join(__dirname, "world.latest.zip"));
        });
    });

    app.get("/api/v1/web/customscript", (req, res) => {
        res.sendFile(path.join(__dirname, "web/customscript.js"));
    });

    callback();
}

function GetUpdate(callback) {
    ServerQuery.fullStat().then((res) =>{
        callback(res);
    });
}

function GetWorldFile(callback) {
    const httpAdapter = require("axios/lib/adapters/http");
    const output = fs.createWriteStream("./world.latest.zip");

    axios.get(`http://${process.env.API_URL}:${process.env.API_PORT}/api/v1/world-download`, { responseType: "stream", adapter: httpAdapter }).then((res) => {
        const stream = response.data;

        stream.on("data", (chunk) => {
            output.write(Buffer.from(chunk));
        });

        stream.on("end", () => {
            output.end();
            callback();
        });
    });
}