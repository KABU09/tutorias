const { Router } = require("express");
const { verMisEvaluaciones,guardarEvaluacion,evaluacionTutoria, seeTutorCourseInformation, confirmTutory, selectSchedule, postSchedule, bookTutory, getTutorySumary, joinToTutory, inviteStudent} = require("../controllers/reservation.controller");
const { exec } = require("../database/database.controller");
const { isTutorando, isTutor } = require("../middlewares/role.middleware");
const { thereIsSession } = require("../middlewares/session.middleware");
const { existTutory, canSeeTutorySummary } = require("../middlewares/tutoria.middleware");

const reservationRouter = Router();

reservationRouter.get('/horario', [thereIsSession, isTutorando], selectSchedule);
reservationRouter.post('/horario', [thereIsSession, isTutorando], postSchedule);
reservationRouter.post('/confirmar', [thereIsSession, isTutorando], confirmTutory);
reservationRouter.get('/informacion', [thereIsSession, isTutorando], seeTutorCourseInformation); 
reservationRouter.get('/agendar', [thereIsSession, isTutorando], bookTutory); 
reservationRouter.get('/resumen', [thereIsSession, existTutory, canSeeTutorySummary], getTutorySumary)
reservationRouter.get('/evaluacion',[thereIsSession, isTutorando],evaluacionTutoria)
reservationRouter.post('/guardarEvaluacion',[thereIsSession, isTutorando],guardarEvaluacion)
reservationRouter.get('/verMisEvaluaciones',[thereIsSession,isTutor],verMisEvaluaciones)
reservationRouter.post('/unirse',[thereIsSession, existTutory, canSeeTutorySummary], joinToTutory)
reservationRouter.post('/invitar', [thereIsSession, isTutorando], inviteStudent);
module.exports = reservationRouter;