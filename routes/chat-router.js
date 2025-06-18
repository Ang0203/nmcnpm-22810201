const express = require("express");
const chatController = require("../controllers/chat-controller.js");
const chatRouter = express.Router();

chatRouter.post("/", chatController.chat);

module.exports = chatRouter;