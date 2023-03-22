const {Router} = require('express')
const{actualizarCurso,verUsuarios,mantenimientoCursos,addCurso,editarCurso}=require('../controllers/admin.controller')
const {isAdmin}=require('../middlewares/role.middleware')
const {thereIsSession} = require('../middlewares/session.middleware')
const adminRouter=Router();

adminRouter.get('/verUsuarios',[thereIsSession,isAdmin],verUsuarios)

adminRouter.get('/mantenimientoCursos',[thereIsSession,isAdmin],mantenimientoCursos);


adminRouter.get('/addCurso',[thereIsSession,isAdmin],addCurso)

adminRouter.get('/editarCurso',[thereIsSession,isAdmin],editarCurso)

adminRouter.post('/actualizarCurso',[thereIsSession,isAdmin],actualizarCurso)
module.exports = adminRouter