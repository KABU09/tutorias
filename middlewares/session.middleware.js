const { request, response } = require('express');

const thereIsSession = async (req = request, res = response, next) => {
    if (!req.session) {
        res.cookie('url', req.originalUrl);
        console.log('there is no session');
        return res.redirect('/')
    }

    if (!req.session.user) {
        res.cookie('url', req.originalUrl);
        console.log('there is no user');
        req.flash('error', 'Error, debes ingresar antes');
        return res.redirect('/')
    }
    next();
}

const redirectTo = async (req, res, next) => {
    if (req.cookies.url) {
        res.clearCookie('url');
        return res.redirect(req.cookies.url);
    }else {
        next();
    }

}

module.exports = {
    thereIsSession,
    redirectTo
}