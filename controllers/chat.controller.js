const { request, response } = require("express");
const { execAndCheck } = require("../database/database.controller");
const { tutoryFormatDatetimeByProps } = require("../helpers/tutoria.helper");
const { formatDatetime } = require("../helpers/dateParser.helper");
const getChat = async (req = request, res = response) => {
    const user = req.session.user;
    const tutoriaId = Number(req.query.tutoriaId);
    const {searchFilter} = req.query;
    let tutories = null;

    const userId = user.usuarioId;
    let messages = null;
    if (tutoriaId) {
        messages = await getMessages(tutoriaId, userId);
    }
    tutories = await getTutories(userId);
    if(searchFilter){
        tutories = filterTutories(tutories, {cursoNombre:searchFilter, tutoriaFechaInicial:searchFilter});
    }

    const { tutoria: selectedTutory, participantes } = req.body
    let tutor = null;
    if(selectedTutory){
        let {tutorPrimerNombre, 
        tutorApellido,
        tutorCorreo, 
        tutorRegionId,
        tutorRegionNombre, 
        tutorUsuarioId} = selectedTutory;
        tutor = {tutorPrimerNombre, 
                    tutorApellido,
                    tutorCorreo, 
                    tutorRegionId,
                    tutorRegionNombre, 
                    tutorUsuarioId}
    }
    res.render('chat', { user, tutories, messages, selectedTutory, participantes, tutor, title:"Chat de Tutorias Cool" });
}
const filterTutories = (tutories=[], {cursoNombre='', tutoriaFechaInicial=''})=>{
    const filteredTutories = tutories.filter((tutory)=>{
        const localCursoNombre = tutory.cursoNombre.trim().toLowerCase();
        const localFechaInicial = tutory.fechaInicial.trim().toLowerCase();
        cursoNombre = cursoNombre.trim().toLowerCase();
        tutoriaFechaInicial = tutoriaFechaInicial.trim().toLowerCase();

        return localCursoNombre.includes(cursoNombre) ||
        localFechaInicial.includes(tutoriaFechaInicial);
    })
    return filteredTutories;
}
const getTutories = async (userId) => {
    const tutories = await execAndCheck('getAllTutoriesByUserId', { id: userId })
    tutories.forEach(tutory => tutoryFormatDatetimeByProps(tutory, { fechaInicialField: 'fechaInicial', fechaFinalField: 'fechaFinal' }))
    return tutories;
}

const getMessages = async (tutoryId, userId) => {
    if (!tutoryId || !userId) {
        return null;
    }

    let messages = await execAndCheck('getMessages', { tutoriaId: tutoryId, usuarioId: userId })

    if (!messages) {
        return null;
    }
    for (const message of messages) {
        message.fecha = formatDatetime(message.fecha);

        if (message.remitente === userId) {
            message.isSender = true;
        }
    }
    return messages;
}

const handleNewMessage = async (req = request, res = response) => {
    const { message, receptor } = req.body;
    const { tutoriaId } = req.query;
    const userId = req.session.user.usuarioId;
    try {
        const messageResponse = await sendMessage(message, receptor, tutoriaId, userId);
        if (!messageResponse) {
            req.flash('error', 'Error al enviar mensaje');
        }
    }
    catch (error) {

        req.flash('error', 'Error al enviar mensaje');
    }
    return getChat(req, res);
}

const sendMessage = async (message = '', receptorId = 0, tutoriaId = '', remitenteId = '') => {
    receptorId = Number(receptorId);
    const isPrivate = receptorId === 0 ? 0 : 1;
    receptorId = receptorId === 0 ? null : receptorId;
    const messageParams = {
        tutoriaId,
        remitente: remitenteId,
        receptor: receptorId,
        contenido: message,
        isPrivate
    }
    const messageResponse = await execAndCheck('sendMessage', messageParams)
    return messageResponse;
}
module.exports = {
    getChat,
    sendMessage,
    handleNewMessage
}