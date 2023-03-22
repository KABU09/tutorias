
const { Router} = require('express');
const { 
    searchCourse ,
    searchCourseForResource, 
    showAllCourses,saveCursosImpartir, 
    getMyTutories, 
    mostrarRecursos,
    administrarPerfil, 
    showInstructions,
    cambiarParametros,
    guardarParametros,
    postFilter,
    updateTutory,
    eliminarRecurso,
    editarRecurso,
    actualizarRecurso
} = require('../controllers/dashboard.controller');

const { thereIsSession, redirectTo} = require('../middlewares/session.middleware.js');
const {userExists} = require('../middlewares/user.middleware');
const { verifyRole } = require('../middlewares/role.middleware');


const dashboardRouter = Router();

dashboardRouter.get('/', [thereIsSession, userExists, verifyRole, redirectTo], getMyTutories);
dashboardRouter.get('/administrar', [thereIsSession], administrarPerfil);
dashboardRouter.get('/buscar-cursos', [thereIsSession], searchCourse);
dashboardRouter.post('/buscar-cursos', [thereIsSession], postFilter);
dashboardRouter.get('/seleccionarCurso', [thereIsSession], showAllCourses)
dashboardRouter.post('/guardarNuevosCursos', [thereIsSession], saveCursosImpartir)
dashboardRouter.get('/buscarCursoRecurso', [thereIsSession], searchCourseForResource)
dashboardRouter.get('/recursos', [thereIsSession], mostrarRecursos)
dashboardRouter.get("/cambiarParametros", [thereIsSession],cambiarParametros)
dashboardRouter.post("/guardarParametros",[thereIsSession],guardarParametros)
dashboardRouter.get('/instrucciones', showInstructions);
dashboardRouter.post('/update-tutory', updateTutory);
dashboardRouter.get('/eliminarRecurso',[thereIsSession],eliminarRecurso)
dashboardRouter.get('/editarRecurso',[thereIsSession],editarRecurso)
dashboardRouter.post('/actualizarRecurso',[thereIsSession],actualizarRecurso)
module.exports = dashboardRouter;