const { Router } = require("express");
const { getChat, handleNewMessage } = require("../controllers/chat.controller");
const { thereIsSession } = require("../middlewares/session.middleware");
const { existTutory, canSeeTutorySummary, checkTutoryId } = require("../middlewares/tutoria.middleware");

const chatRouter = Router();

chatRouter.get('/', [thereIsSession], getChat);
chatRouter.get('/tutoria', [thereIsSession, checkTutoryId, existTutory, canSeeTutorySummary], getChat);
chatRouter.post('/send', [thereIsSession, checkTutoryId, existTutory, canSeeTutorySummary], handleNewMessage)
module.exports = chatRouter;