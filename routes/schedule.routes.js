const { Router, request, response } = require('express');
const { showSchedule, deleteSchedule, insertSchedule} = require('../controllers/schedule.controller');
const { exec } = require('../database/database.controller');
const { isTutor } = require('../middlewares/role.middleware');
const { thereIsSession } = require('../middlewares/session.middleware');

const scheduleRouter = Router();

scheduleRouter.get('/', [thereIsSession, isTutor], showSchedule); 

scheduleRouter.post('/', [thereIsSession, isTutor], insertSchedule);

scheduleRouter.delete('/', [thereIsSession, isTutor], deleteSchedule);

module.exports = scheduleRouter;