const { tutoryFormatDatetime } = require('../helpers/tutoria.helper');
const { execAndCheck } = require("./database.controller");

const getTutoria = async (tutoriaId) => {
    const tutoria = await execAndCheck('GET_TUTORIA', { id: tutoriaId },'Error al cargar tutoria');
    if (tutoria) {
        return tutoria[0];
    }
    return null;
}
const getTutoriaPopulate = async(tutoriaId) =>{
    const result = await execAndCheck('GET_TUTORIA_POPULATE', {id:tutoriaId}, 'Error al cargar tutoria');
    if(result){
        let tutoria = result[0];
        tutoria = tutoryFormatDatetime(tutoria);
        return tutoria;
    }
    return null;
}
const getParticipantes = async(tutoryId)=>{
    const participantes = await execAndCheck('GET_TUTORIA_ESTUDIANTE_BY_ID', {id:tutoryId});
    return participantes;
}

const getAllTutoriesByTutorando = async(tutorandoId, estado)=>{
    const tutories = await execAndCheck('GET_ALL_TUTORIAS_THUMBNAIL', {id: tutorandoId, estado:estado});
    if(tutories){
        tutories.forEach(tutory=>tutoryFormatDatetime(tutory))
    } 
    return tutories;
}

const getAllTutoriesByTutor= async(tutorId, estado)=>{
    const tutories = await execAndCheck('getAllTutoriasThumbnailByTutor', {tutorId, estado});
    if(tutories){
        tutories.forEach(tutory=>tutoryFormatDatetime(tutory))
    } 
    return tutories;
}

const updateTutoryStatus = async(tutoryId, status)=>{
    try{
        await execAndCheck('UPDATE_TUTORY_STATUS', {ID:tutoryId, ESTADO:status});
        return true;
    }
    catch(err){
        console.log('updateTutoryStatus: ', err);
        return false;
    }
}

const searchOpenTutories = async(searchFilter) => {
    const tutories = await execAndCheck('buscarTutoriasAbiertas', { pattern: `%${searchFilter}%`});
    return tutories;
}

const joinToOpenTutory = async(tutoriaId, estudianteId)=>{
    const result = await execAndCheck('joinToOpenTutory', { tutoriaId, estudianteId})
    return result;
}

module.exports = {
    getTutoria,
    getParticipantes,
    getTutoriaPopulate,
    getAllTutoriesByTutorando,
    getAllTutoriesByTutor,
    updateTutoryStatus,
    searchOpenTutories,
    joinToOpenTutory
}