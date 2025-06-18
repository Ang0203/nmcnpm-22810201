require("dotenv").config();
const ENV = process.env.ENV || "development";
const PORT = process.env.PORT || 22700;
const SERVER_URL = process.env.SERVER_URL || `http://localhost:${PORT}`;

const express = require("express");
const app = express();

// [Static files + Read body from POST]
app.use(express.static("dist"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// [Routes]
app.use("/chat", require("./routes/chat-router.js"));
app.get('*', (req, res) => {
    res.sendFile(__dirname + "/dist/index.html");
});

// [Global Error Handler]
app.use((err, req, res, next) => {
    console.error("[Error]: ", err);

    if (err.response) {
        return res.status(err.response.status).json({
            error: "API Error",
            message: err.response.data
        });
    };

    return res.status(500).json({
        error: "Internal Server Error",
        message: err.message || "Unexpected error"
    });
});

// [Run server]
app.listen(PORT, () => {
    console.log(`Server is running on ${SERVER_URL}`); 
})