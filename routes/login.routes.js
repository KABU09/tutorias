const {Router} = require('express');
const { googleSignIn } = require('../controllers/accountCreation.controller');
const { validateGoogleToken } = require('../middlewares/google.middleware');
const loginRouter = Router();

loginRouter.post('/google',[validateGoogleToken],googleSignIn);
loginRouter.get('/', (req, res)=>{
    res.render('ingresar', {title: 'Ingresar'});
});

loginRouter.get('/logout',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});
//loginRouter.post('/ingresar',[validateGoogleToken, userExist],ingresarAlPanel);

module.exports = loginRouter;