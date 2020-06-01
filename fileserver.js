require('dotenv').config()
const AdmZip = require('adm-zip');
const fileSystem = require("fs");
const express = require("express");
const path = require('path');

const app = new express();
const port = process.env.PORT;

app.get("/", (req, res) => {
    res.redirect(process.env.WEBSERVER_URL + ":" + process.env.WEBSERVER_PORT);
})

app.get("/api/v1/world-download", (req, res) => {
    console.debug("Recieved World Download Request");
    var zip = new AdmZip();
    zip.addLocalFolder("./server/world");
    zip.writeZip("./world.zip");

    res.sendFile(path.join(__dirname, "world.zip"));
    console.debug("Sent World File");
})

app.listen(port, () => {
    console.log(`Started Express on ${port}`);
});