const {Router} = require('express')
const { addUserToDb,showFormTutor,saveParametrosTutor,selectPlataforma, savePlataformaTutor} = require('../controllers/accountCreation.controller');
const { newUser } = require('../middlewares/user.middleware');
const {exec} = require('../database/database.controller');
const {isTutor} = require('../middlewares/role.middleware')
// const { saveParametrosTutor } = require('../controllers/dashboard.controller');
const creationRouter = Router()

const showTipoCuenta = async(req,res)=>{
    let regiones = await exec('GetRegiones',{})
    res.render('tipoCuenta',{title: 'Tipo de Cuenta',region:regiones.data.recordset})
}
creationRouter.get('/',showTipoCuenta)
creationRouter.post('/saveData',[newUser],(req,res)=>{
    const {name,email}=req.session.user
    const {tipoUsuario,selectpicker}=req.body
    addUserToDb(tipoUsuario,name,email,selectpicker) 
    if(tipoUsuario=='tutor'){
        res.redirect('selectModalidad')
    }
    else{
        res.redirect('../dashboard')
    }

})
creationRouter.get('/selectModalidad',showFormTutor)
creationRouter.post('/saveInfoTutor',saveParametrosTutor)
creationRouter.get('/selectPlataforma',selectPlataforma)
creationRouter.post('/savePlataformaTutor',savePlataformaTutor)
module.exports=creationRouter;