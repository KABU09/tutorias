const { request, response } = require('express');
const { exec } = require('../database/database.controller');

const verifyRole = async (req = request, res = response, next) => {
    if (!req.session.user) {
        console.log('[verifyRole:6] Cookie is not found. Session Middlewares must be executed first');
        return res.redirect('/');
    }
    
    if(!req.session.user.usuarioId) {
        console.log('[verifyRole:11] userId not found. Session Middlewares must be executed first');
        return res.redirect('/');
    }
    const { usuarioId } = req.session.user;

    let role;

    let result = await exec('GET_TUTOR', { id: usuarioId })

    if (result.error){
        console.log('User not found');
        return res.redirect('/');
    }
    if (result.isEmpty()) {
        result = await exec('GET_ESTUDIANTE', { id: usuarioId })
    }
    else {
        role = 'Tutor';
        const tutorId = result.data.recordset[0].id;
        req.session.user.tutorId = tutorId;

        req.session.user.role = role;

        return next();
    }

    if (result.isEmpty()) {//if it is empty it means that user is not a student either
        role='Admin';
        const adminId=(await exec('getAdmin',{ID:usuarioId})).data.recordset[0].id
        console.log('El id recibido del admin es: '+adminId)
        req.session.user.adminId=adminId;
        req.session.user.role=role;
        return next()
    }
    else {
        role = 'Tutorando';
        const tutorandoId = result.data.recordset[0].id;
        req.session.user.tutorandoId = tutorandoId;

        req.session.user.role = role;
        return next();
    }

}

const isTutor = async (req, res, next) => {
    if(req.session.user.role === 'Tutor') {
        next();
    } else {
        req.flash('error', 'Acceso denegado');
        return res.redirect('/dashboard');
    };
}

const isTutorando = async (req, res, next) => {
    if (req.session.user.role === 'Tutorando') {
        next();
    } else {
        req.flash('error', 'Acceso denegado');
        return res.redirect('/dashboard');
    };
}
const isAdmin = async(req,res,next)=>{
   if (req.session.user.role === 'Admin') {
       next();
   }
   else{
        req.flash('error', 'Acceso denegado');
        return res.redirect('/dashboard');
   }
}
module.exports = {
    verifyRole,
    isTutor,
    isTutorando,
    isAdmin
}