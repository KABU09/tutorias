const { response, request } = require("express");
const { exec } = require("../database/database.controller");

const showSchedule = async (req = request, res = response) => {
    if (!req.session.user.tutorId) {
        req.flash('error', 'Error al mostrar los horarios')
        return res.render('schedule', { title: 'Seleccionar horarios', user: req.session.user, schedules, warning: req.flash('warning'), error: req.flash('error'), success: req.flash('success') });
    }
    const { tutorId } = req.session.user;
    let schedules = await exec('getSchedule', { id: tutorId});
    if (schedules.error) {
        schedules = [];
        console.log(schedules.error);
        req.flash('error', 'Error al mostrar los horarios')
        return res.render('schedule', { title: 'Seleccionar horarios', user: req.session.user, schedules, warning: req.flash('warning'), error: req.flash('error'), success: req.flash('success') });
    } else if (schedules.isEmpty()) {
        schedules = [];
        req.flash('warning', 'No hay horarios guardados disponibles')
        return res.render('schedule', { title: 'Seleccionar horarios', user: req.session.user, schedules, warning: req.flash('warning'), error: req.flash('error'), success: req.flash('success') });
    } else {
        schedules = schedules.data.recordset.map(({ fechaInicio, fechaFin, id }) => {
            return {
                id,
                fechaInicio: `${new Date(fechaInicio).toLocaleString('es', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Etc/UTC' })}`,
                fechaFin: `${new Date(fechaFin).toLocaleTimeString('es', { timeStyle: 'medium', timeZone: 'Etc/UTC' })}`,
            }
        });
    }
    res.render('schedule', { title: 'Seleccionar horarios', user: req.session.user, schedules, warning: req.flash('warning'), error: req.flash('error'), success: req.flash('success') });
};

const deleteSchedule = async (req = request, res = response) => {
    if (!req.body.id) {
        req.flash('error', 'Error al borrar el horario');
        return res.redirect(303, '/seleccionar-horarios');
    }
    const result = await exec('deleteDate', { id: Number(req.body.id), tutorId: req.session.user.tutorId });
    if (result.error) {
        req.flash('error', 'Error al borrar el horario');
        return res.redirect(303, '/seleccionar-horarios');
    }
    if (!result.data.rowsAffected[0]) {
        req.flash('error', 'Error al borrar el horario');
        return res.redirect(303, '/seleccionar-horarios');
    }
    req.flash('success', 'Horario borrado exitosamente');
    return res.redirect(303, '/seleccionar-horarios');
};

const insertSchedule = async (req, res) => {
    const hours = ['0:00', '0:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];
    if (!req.body.date || !req.body.startTime || !req.body.endTime) {
        console.log('[scheduleRouterPost:53] No vienen todos los parametros');
        req.flash('error', 'Error al agregar el nuevo horario');
        return res.redirect('/seleccionar-horarios');
    }
    const re = new RegExp('^([0-1]?[0-9]|2[0-3]):([0-5][0-9]$)');
    
    if(!re.test(req.body.startTime) || !re.test(req.body.endTime)) {
        req.flash('error', 'Error al agregar el nuevo horario');
        return res.redirect('/seleccionar-horarios');
    }

    if (!(hours.includes(req.body.startTime)) || !(hours.includes(req.body.endTime))) {
        req.flash('error', 'Error al agregar el nuevo horario');
        return res.redirect('/seleccionar-horarios');
    }

    const startDate = new Date(`${req.body.date} ${req.body.startTime}`);
    const today = new Date();
    if (startDate < today) {
        req.flash('error', 'Error, no se pueden agregar horarios del pasado');
        return res.redirect('/seleccionar-horarios');
    }


    const startTimeIndex = hours.indexOf(req.body.startTime);
    const endTimeIndex = hours.indexOf(req.body.endTime);
    if (startTimeIndex > endTimeIndex) {
        req.flash('error', 'Error, la hora de inicio debe ser menor a la hora de fin');
        return res.redirect('/seleccionar-horarios');
    }

    const { tutorId } = req.session.user;
    const result = await exec('insertDate', { start: `${req.body.date} ${req.body.startTime}`, end: `${req.body.date} ${req.body.endTime}`, tutorId });
    if (result.error) {
        console.log('[scheduleRouterPost:72] Error al insertar la fecha');
        req.flash('error', 'Error al agregar el nuevo horario');
        return res.redirect('/seleccionar-horarios');
    }
    req.flash('success', 'Horario agregado exitosamente');
    res.redirect('/seleccionar-horarios')
};

module.exports = {
    showSchedule,
    deleteSchedule,
    insertSchedule
}




