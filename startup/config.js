module.exports = function (app, express, cors, file_upload,morgan) {
  app.use(express.json());
  app.use(cors());
  app.use(
    file_upload({
      createParentPath: true,
      useTempFiles: true,
      tempFileDir: "/tmp",
    })
  );
  app.use(express.urlencoded({ extended: false }));
  app.use(express.static("public"));
  
  app.use(morgan(":method - :url - :status - :res[content-length] - :response-time ms"))
  // app.use(morgan("combined"))
};