const { Router } = require('express');
const { showIncome, postIncome } = require('../controllers/income.controller');
const { isTutor } = require('../middlewares/role.middleware');
const { thereIsSession } = require('../middlewares/session.middleware');

const incomeRouter = Router();

incomeRouter.get('/', [thereIsSession, isTutor], showIncome);

incomeRouter.post('/', [thereIsSession, isTutor], postIncome);

module.exports = incomeRouter;