const { execAndCheck } = require("./database.controller");

const getTiposSesionByTutorId = async (tutorId) => {
    return await execAndCheck('GET_TIPO_SESION_TUTOR_BY_TUTOR_ID',
        { id: tutorId },
        'Error al obtener tipo de sesion');
}

const getTipoSesionBydId = async(id)=>{
    const result = await execAndCheck('GET_TIPO_SESION_BY_ID', {id:id});
    if(result){
        return result[0];
    }
    return null;
}

module.exports = {
    getTiposSesionByTutorId,
    getTipoSesionBydId
}