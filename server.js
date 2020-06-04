const minecraft_query = require("minecraft-query");
const fs = require("fs");
const admzip = require("adm-zip");
const path = require("path");
const express = require("express");
require('dotenv').config();

const ServerQuery = new minecraft_query({ host: process.env.MINECRAFT_URL, port: process.env.MINECRAFT_PORT, timeout: 7500 });

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
                    address: process.env.MINECRAFT_URL,
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

    AddAPIListeners(() => {
        StartExpress();
    });
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
    AddAPIListeners(() => {
        StartExpress();
    });
}

function AddAPIListeners(callback) {
    app.get("/api/v2/world-download", (req, res) => {
        var zip = new admzip();
        zip.addLocalFolder(process.env.WORLD_FILE_LOCATION);
        zip.writeZip("./latest.world.zip");
    
        res.sendFile(path.join(__dirname, "latest.world.zip"));
    })

    app.get("/api/v2/web/customscript", (req, res) => {
        res.sendFile(path.join(__dirname, "web/customscript.js"));
    });

    callback();
}

function GetUpdate(callback) {
    ServerQuery.fullStat().then((res) =>{
        callback(res);
    });
}

function StartExpress() {
    app.listen(port, () => {
        console.log(`Started Express on ${port}`);
    });
}