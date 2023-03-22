const { request, response } = require("express");
const { exec, execAndCheck } = require("../database/database.controller");
const { getTutor } = require("../database/tutor.controller");
const { getTutorCurso, getTutorCourseInformacion } = require("../database/tutorCurso.controller");
const { joinToOpenTutory, getParticipantes } = require("../database/tutoria.controller");

const seeTutorCourseInformation = async(req = request, res = response) => {
    const tutorCursoId = req.query.tutorCursoId;

    if (!tutorCursoId) {
        console.log("There is no tutorCursoId in the url");
        req.flash('error', 'Error al cargar el curso')
        return res.redirect('/dashboard');
    }

    const tutorCourseInformation = await getTutorCourseInformacion(tutorCursoId);
    if (!tutorCourseInformation || !Object.entries(tutorCourseInformation).every(d => d[1])) {
        req.flash('error', 'Error al cargar el curso');
        return res.redirect('/dashboard');
    }

    return res.render('verInformacionTutoria', {
        user: req.session.user,
        data: tutorCourseInformation,
        error: req.flash('error')
    });

}

const bookTutory = async(req = request, res = response) => {
    const tutorCursoId = req.query.tutorCursoId;

    if (!tutorCursoId) {
        console.log("There is no tutorCursoId in the url");
        req.flash('error', 'Error al cargar el curso')
        return res.redirect('/dashboard');
    }
    const tutorCourseInformation = await getTutorCourseInformacion(tutorCursoId);
    if (!tutorCourseInformation || !Object.entries(tutorCourseInformation).every(d => d[1])) {
        req.flash('error', 'Error al cargar el curso');
        return res.redirect('/dashboard');
    }

    return res.render('agendarTutoria', {
        user: req.session.user,
        data: tutorCourseInformation,
        error: req.flash('error'),
        title: 'Agendar Tutoria'
    });
}

const confirmTutory = async(req = request, res = response) => {
    const { modalidad, tipoDeSesion, caracter = 1, cantParticipantes = 1, plataforma } = req.body;
    const tutorCursoId = req.query.tutorCursoId;
    const tutorCursoInformation = await getTutorCurso(tutorCursoId);
    const tutorId = tutorCursoInformation.tutorId;
    const tutorUserId = tutorCursoInformation.usuarioId;
    const tutor = await getTutor(tutorUserId);
    const retribucionId = tutor.retribucionId;
    const tutorandoId = req.session.user.tutorandoId;
    const estadoTutoriaId = 1;

    const tutoria = {
        modalidad,
        tipoDeSesion,
        caracter,
        cantParticipantes,
        tutorCursoId,
        tutorCursoInformation,
        tutorId,
        tutorUserId,
        retribucionId,
        tutorandoId,
        estadoTutoriaId,
        plataforma,
        tutor
    }

    req.session.tutoria = tutoria;
    return res.redirect(`/tutoria/horario`);
}

const selectSchedule = async(req = request, res = response) => {
    if (!req.session.tutoria || !Object.entries(req.session.tutoria).every(d => d[1])) {
        req.flash('error', 'Error al reservar la tutoria');
        return res.redirect(`/dashboard`);
    }

    const {
        tutorCursoId,
        tutorId,
    } = req.session.tutoria;

    let schedules = await exec('getSchedule', { id: tutorId });
    if (schedules.error) {
        schedules = [];
        req.flash('error', 'Error al reservar la tutoria');
        console.log('Error al mostrar los horarios disponibles');
        return res.redirect(`/tutoria/informacion?tutorCursoId=${tutorCursoId}`);
    } else if (schedules.isEmpty()) {
        schedules = [];
        req.flash('error', 'Error al reservar la tutoria');
        console.log('El tutor seleccionado no tiene horarios disponibles');
        return res.redirect(`/tutoria/informacion?tutorCursoId=${tutorCursoId}`);
    } else {
        schedules = schedules.data.recordset.map(({ fechaInicio, fechaFin, id }) => {
            let startDateTime = new Date(fechaInicio).toISOString().split('T');
            let startDate = startDateTime[0];
            let startTime = startDateTime[1].split(':00.')[0];
            let endDateTime = new Date(fechaFin).toISOString().split('T');
            let endTime = endDateTime[1].split(':00.')[0];
            return {
                fecha: `${id},${startDate},${startTime},${endTime}`,
                id,
                fechaInicio: `${new Date(fechaInicio).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Etc/UTC' })}`,
                fechaFin: `${new Date(fechaFin).toLocaleTimeString('es', { timeStyle: 'medium', timeZone: 'Etc/UTC' })}`,
            }
        });
    }
    res.render('selectSchedule', { title: 'Agendar tutoria', user: req.session.user, schedules, error: req.flash('error'), warning: req.flash('warning'), success: req.flash('success') });
}

const postSchedule = async(req = request, res = response) => {
    if (!req.session.tutoria || !Object.entries(req.session.tutoria).every(d => d[1])) {
        req.flash('error', 'Error al reservar la tutoria');
        delete req.session.tutoria;
        return res.redirect('/dashboard');
    }

    let { modalidad, tipoDeSesion, caracter, cantParticipantes, tutorCursoId, retribucionId, tutorandoId, estadoTutoriaId, plataforma, tutor } = req.session.tutoria; //const

    const hours = ['00:00', '00:30', '01:00', '01:30', '02:00', '02:30', '03:00', '03:30', '04:00', '04:30', '05:00', '05:30', '06:00', '06:30', '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];

    if (!req.body) {
        req.flash('error', 'Error al reservar la tutoria');
        console.log('No hay body al guardar horario de tutoria');
        return res.redirect(`/tutoria/informacion?tutorCursoId=${tutorCursoId}`);
    }

    let body = [];
    let min = 0;
    let max = 0;

    try {
        body = Object.keys(req.body);
        body = body.map(d => {
            let datetime = d.split(',');
            return { id: datetime[0], date: datetime[1], start: datetime[2], end: datetime[3] }
        })
        if (body.length < 2) {
            req.flash('error', 'Los horarios deben sumar como mínimo 1 hora')
            return res.redirect(`/tutoria/horario`);
        }

        if (!body.every((d, _, [arr]) => d['date'] === arr['date'])) {
            req.flash('error', 'Los horarios deben ser el mismo día')
            return res.redirect(`/tutoria/horario`);
        }

        if (!body.every((d) => hours.includes(d['start']) && hours.includes(d['end']))) {
            req.flash('error', 'Error, las horas deben ser multiplos de 30 minutos')
            return res.redirect(`/tutoria/horario`);
        }

        if (!body.slice(1).every((d, i) => hours.indexOf(d['start']) - hours.indexOf(body[i]['start']) === 1)) {
            req.flash('error', 'Los horarios deben ser contiguos');
            return res.redirect(`/tutoria/horario`);
        }

        let bodyIndex = body.map(d => hours.indexOf(d.start));
        min = hours[Math.min(...bodyIndex)];
        bodyIndex = body.map(d => hours.indexOf(d.end));
        max = hours[Math.max(...bodyIndex)];
    } catch (err) {
        req.flash('error', 'Error al seleccionar el horario');
        return res.redirect(`/tutoria/horario`);
    }

    let diff = Math.abs(new Date(`${body[0].date} ${min}`) - new Date(`${body[0].date} ${max}`)) / (60 * 60 * 1000);
    
    const cost = ((retribucionId == 3) ? ((cantParticipantes == 1) ? ((diff - Math.floor(diff)) ? (diff * tutor.costoHoraPersona) : ((diff * tutor.costoHoraPersona) + tutor.incrementoTarifaIndividual)) : ((diff - Math.floor(diff)) ? (diff * tutor.costoHoraGrupal) : ((diff * tutor.costoHoraGrupal) + tutor.incrementoTarifaGrupal))) : 0);

    console.log('info desde post schedule');
    console.log({ participantes: cantParticipantes, cost, diff, tutorHoraPersona: tutor.costoHoraPersona, tutorHoraGrupal: tutor.costoHoraGrupal, tutorIncrementoIndividual: tutor.incrementoTarifaIndividual, tutorIncrementoGrupal: tutor.incrementoTarifaGrupal });

    let result = await exec('INSERT_TUTORIA', { FECHAINICIAL: `${body[0].date} ${min}`, FECHAFINAL: `${body[0].date} ${max}`, RETRIBUCIONID: retribucionId, CANTIDADESTUDIANTES: cantParticipantes, TUTORCURSOID: tutorCursoId, ESTADOTUTORIAID: estadoTutoriaId, PLATAFORMAID: plataforma, CARACTERID: caracter, MODALIDADID: modalidad, TIPOSESIONID: tipoDeSesion, COSTO: cost });

    if (result.error) {
        console.log("Error al insertar tutoria");
        req.flash('error', 'Error al reservar la tutoria');
        delete req.session.tutoria;
        return res.redirect('/dashboard');
    }

    const tutoriaId = result.data.recordset[0].id;

    result = await exec('INSERT_TUTORIA_ESTUDIANTE', { TUTORIAID: tutoriaId, HORAINGRESO: null, HORAEGRESO: null, EVALUACIONID: null, ESTUDIANTEID: tutorandoId });

    if (result.error) {
        console.log("Error al insertar tutoria_estudiante");
        req.flash('error', 'Error al reservar la tutoria');
        delete req.session.tutoria;
        return res.redirect('/dashboard');
    }

    for (b of body) {
        let result = await exec('setSchedule', { idDate: b.id, idTutoria: tutoriaId });
        if (result.error) {
            console.log(result.error);
        }
    }

    delete req.session.tutoria;

    req.flash('success', 'Tutoria reservada exitosamente');
    res.redirect(`/tutoria/resumen?tutoriaId=${tutoriaId}`);
}

const getTutorySumary = async(req = request, res = response) => {
    const { tutoria, participantes } = req.body;
    console.log({ mytutoryfromSumary: tutoria });

    const grupal = tutoria.tipoSesionId == 3 ? true : false;
    const isOpenTutory = tutoria.caracterId === 3 ? true : false;

    let students = null;
    if (grupal) {

        const currentStudents = participantes.map(p => p.correo.trim());
        students = await execAndCheck('getAllTutorandos',{});
        students.map(s => {
            s.correo = s.correo.trim();
            return s;
        });
        students = students.filter(s => !currentStudents.includes(s.correo));
        tutoria.costoTotalPorPersona = tutoria.costoTotal / tutoria.tutoriaCantidadEstudiantes;
    }
    return res.render('resumenTutoria', { title: 'Resumen Tutoría', user: req.session.user, tutoria, participantes, grupal, isOpenTutory, students, error: req.flash('error'), success: req.flash('success') });
}

const inviteStudent = async (req, res) => {
        if (!req.body.tutoriaId) {
            req.flash('error', 'Error al mostrar el resumen de la tutoria');
            return res.redirect('/dashboard');
        }

        if (!req.body.email) {
            req.flash('error', 'Error al invitar al tutor');
            return res.redirect(`/tutoria/resumen?tutoriaId=${req.body.tutoriaId}`);
        }

        let currentStudents = await getParticipantes(req.body.tutoriaId);

        if(!currentStudents) {
            req.flash('error', 'Error al invitar al tutor');
            return res.redirect(`/tutoria/resumen?tutoriaId=${req.body.tutoriaId}`);
        }

        currentStudents = currentStudents.map(s => s.correo.trim());
        
        if(currentStudents.includes(req.body.email)) {
            req.flash('error', 'El estudiante ya está en la tutoría');
            return res.redirect(`/tutoria/resumen?tutoriaId=${req.body.tutoriaId}`);
        }

        let capacity = await exec('getCapacity', { tutoriaId: req.body.tutoriaId });

        if (capacity.error) {
            req.flash('error', 'Error al invitar al tutor');
            return res.redirect(`/tutoria/resumen?tutoriaId=${req.body.tutoriaId}`);
        }

        capacity = capacity.data.recordset[0].capacity;

        if (!capacity) {
            req.flash('error', 'No hay cupo en esta tutoria');
            return res.redirect(`/tutoria/resumen?tutoriaId=${req.body.tutoriaId}`);
        }

        let student = await exec('getStudentByEmail', { email: req.body.email });
        if (student.error) {
            req.flash('error', 'Error al invitar al tutor');
            return res.redirect(`/tutoria/resumen?tutoriaId=${req.body.tutoriaId}`);
        }

        if (student.isEmpty()) {
            req.flash('error', 'El estudiante ingresado no existe');
            return res.redirect(`/tutoria/resumen?tutoriaId=${req.body.tutoriaId}`);
        }
        student = student.data.recordset[0].id;
        const result = await exec('INSERT_TUTORIA_ESTUDIANTE', { TUTORIAID: req.body.tutoriaId, HORAINGRESO: null, HORAEGRESO: null, EVALUACIONID: null, ESTUDIANTEID: student });

        if (result.error) {
            req.flash('error', 'Error al invitar al tutor');
            return res.redirect(`/tutoria/resumen?tutoriaId=${req.body.tutoriaId}`);
        }

        req.flash('success', 'El estudiante ha sido invitado correctamente');
        res.redirect(`/tutoria/resumen?tutoriaId=${req.body.tutoriaId}`);
}

const joinToTutory = async(req = request, res = response) => {
    const { tutoria, participantes } = req.body;
    const tutoriaId = tutoria.tutoriaId;
    const tutorandoId = req.session.user.tutorandoId;

    const result = await joinToOpenTutory(tutoriaId, tutorandoId)
    if(!result){
        req.flash('error', 'Error al unirse a tutoria');
        return res.status(400).send({ error: 'error al unirse a tutoria' })
    }
    return res.send({ result });

}

const evaluacionTutoria = async(req = request, res = response) => {
    let message = req.query.message
    if (message == 'success') {
        req.flash('success', 'Su evaluacion ha sido guardada exitosamente')
        return res.render('encuesta', { user: req.session.user, tutoriaId: req.query.tutoriaId, success: req.flash("success") })
    } else if (message == 'error') {
        req.flash('error', 'Hubo un error al guardar su evaluación, inténtalo nuevamente')
        return res.render('encuesta', { user: req.session.user, tutoriaId: req.query.tutoriaId, error: req.flash("error") })
    }
    return res.render('encuesta', { user: req.session.user, tutoriaId: req.query.tutoriaId })
}

const guardarEvaluacion = async(req, res) => {
    let { tutoriaId, puntosAgendaAbarcados, completitud, practica, foro, rating } = req.body
    console.log("El id de la tutoria esss: " + tutoriaId)
    console.log('Rating: ' + rating)
    let message = ""
    let insercion = await exec("guardarEvaluacion", { puntosAgendaAbarcados, completitud, practica, foro, rating, tutoriaId })
    if (!insercion.error) {
        console.log('Evaluacion guardada')
        message = 'success'
    } else {
        message = "error"
        console.log('No todo salio bien')
    }
    res.redirect('evaluacion?tutoriaId=' + tutoriaId + '&message=' + message)
}

const verMisEvaluaciones = async(req, res) => {
    let tutorId = req.session.user.tutorId
    let {user} = req.session
    let misEvaluaciones = await exec("getMisEvaluaciones", { tutorId })
    if (!misEvaluaciones.error) {
        misEvaluaciones = misEvaluaciones.data.recordset
        if (misEvaluaciones.length == 0) {
            req.flash("error", "Nadie ha calificado esa tutoría aún")
            return res.redirect("/dashboard")
        } 
        else {
            return res.render("misEvaluaciones", { user,misEvaluaciones})
        }
    } else {
        console.log('Ha ocurrido un error!')
    }
}
module.exports = {
    seeTutorCourseInformation,
    bookTutory,
    confirmTutory,
    selectSchedule,
    postSchedule,
    getTutorySumary,
    evaluacionTutoria,
    guardarEvaluacion,
    verMisEvaluaciones,
    joinToTutory,
    inviteStudent
}