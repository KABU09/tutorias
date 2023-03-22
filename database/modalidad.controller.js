const { execAndCheck } = require("./database.controller");

const getModalidadesByTutorId = async (tutorId) => {
    if (!tutorId) {
        console.log('TutorId in tutorCursoInformation not found');
        return null;
    }

    return await execAndCheck('GET_MODALIDAD_BY_TUTORID', { id: tutorId },
        'Error al obtener modalidad');
}

const getModalidadById = async(id)=>{
    const result = await execAndCheck('GET_MODALIDAD_BY_ID', {id:id}, `Error al obtener modadlidad con id ${id}`);
    if(result){
        return result[0];
    }
    return null;
}

module.exports = {
    getModalidadesByTutorId,
    getModalidadById
}