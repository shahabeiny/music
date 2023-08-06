const express = require("express");
const app = express();
const file_upload = require('express-fileupload')
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config()
const debug = require("debug")("app:main");
const config = require("config");
const router = require("./src/routes/index");


require("./startup/config")(app, express, cors,file_upload,morgan);
require("./startup/db")();
require("./startup/logging")();

app.use("/api", router); 
 const port = process.env.PORT
app.listen(port, () => console.log(`listening on port : ${port}`));
