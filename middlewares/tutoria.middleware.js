//@ts-check
const { request, response } = require("express");
const { getParticipantes,getTutoriaPopulate } = require("../database/tutoria.controller");

const canSeeTutorySummary = async(req=request, res=response, next)=>{
    const tutoriaId = req.query.tutoriaId;
    const participantes = req.body.participantes;
    if(!participantes){
        req.flash('error', 'Error al cargar resumen de la tutoría');
        return res.redirect('/dashboard');
    }
    
    if(req.session.user.role === "Tutorando"){
        const tutorandoId = req.session.user.tutorandoId;
        const idParticipantes = participantes.map(value=>value.estudianteId);
        const tutoria = req.body.tutoria;

        const isOpenTutory = tutoria.caracterId == 3;

        if(!isOpenTutory && !idParticipantes.includes(tutorandoId) ){
            req.flash('error', 'Acceso denegado. Esta no es una tutoría abierta');
            return res.redirect('/dashboard');
        }
        
        if(isOpenTutory && !idParticipantes.includes(tutorandoId)){
            const cantidadEstudiantesRegistrados = participantes.length;
            const maximoEstudiantesPermitidos = tutoria.tutoriaCantidadEstudiantes;
            const cuposDisponibles = maximoEstudiantesPermitidos - cantidadEstudiantesRegistrados;
            if(cuposDisponibles <= 0){
                req.flash('error', 'Acceso denegado. No hay cupos disponibles');
                return res.redirect('/dashboard');
            }

        }

        return next();
    }
    else if(req.session.user.role === "Tutor"){
        const tutorId = req.session.user.tutorId;
        const tutoria = req.body.tutoria;
        if(tutorId !== tutoria.tutorId){
            req.flash('error', 'Acceso denegado 26');
            return res.redirect('/dashboard');
        }
        return next();
    }
    req.flash('error', 'Acceso denegado 31');
    return res.redirect('/dashboard');
}

const existTutory = async(req=request, res=response, next)=>{
    const tutoriaId = req.query.tutoriaId;
    const tutoria = await getTutoriaPopulate(tutoriaId);

    if(!tutoria){
        req.flash('error', 'Error al cargar resumen de la tutoría: 258');
        return res.redirect('/dashboard');
    }

    const participantes = await getParticipantes(tutoriaId);
    
    if(!participantes){
        req.flash('error', 'Error al cargar resumen de la tutoría: 264');
        return res.redirect('/dashboard');
    }

    req.body.tutoria = tutoria;
    req.body.participantes = participantes;
    return next();
}

const checkTutoryId = (req=request, res=response, next)=>{
    const tutoriaId = req.query.tutoriaId;
    if(!tutoriaId){
        return res.redirect('/chat');
    }
    next();
}

module.exports = {
    canSeeTutorySummary,
    existTutory,
    checkTutoryId   
}
