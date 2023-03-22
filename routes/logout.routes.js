const {Router} = require('express');

const logoutRouter = Router();

logoutRouter.get('/',(req,res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = logoutRouter;