require("dotenv").config();

if (process.env.SERVERTYPE == 0) {
    console.log("Starting Webserver...");
    require("./webserver.js");
} else if (process.env.SERVERTYPE == 1) {
    console.log("Starting Fileserver...");
    require("./fileserver.js")
}