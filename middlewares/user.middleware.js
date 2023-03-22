const { request, response } = require("express");
const { exec } = require("../database/database.controller");

const userExists = async (req = request, res = response, next) => {
    if (!req.session.user) {
        console.log('[userExists:6] Cookie is not found. Session Middlewares must be executed first');
        return res.redirect('/');
    }
    const { email } = req.session.user
    const result = await exec('existe', { correo: email })
    if (result.data['recordset'].length != 0) {

        const user = result.data.recordset[0];

        req.session.user.usuarioId = user.id;


        req.existe = true
        return next()
    }
    else {
        console.log('Middleware failed in userExist', { error: result.error, isEmpty: result.isEmpty() });
        return res.redirect('../')
    }
}

const newUser = async (req, res, next) => {
    const { email } = req.session.user
    const result = await exec('existe', { correo: email })
    if (result.data['recordset'].length == 0) {
        req.esNuevo = true
        next()
    }
    else {
        console.log('Middleware failed. Cannot create user. User already exists', { error: result.error, isEmpty: result.isEmpty() });
        req.flash('error', 'Error, el usuario ya existe');
        res.redirect('../')
    }
}

module.exports = {
    userExists,
    newUser
}