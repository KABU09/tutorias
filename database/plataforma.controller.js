const { execAndCheck } = require("./database.controller");


const getPlataformaById = async(id)=>{
    let plataforma = null;
    if(id){
        const result = await execAndCheck('GET_PLATAFORMA_BY_ID', {id:id}, 'Error al obtener plataforma')
        if(result){
            plataforma = result[0];
        }
    }
    return plataforma;
}
const getPlataformasByTutorId = async(tutorId)=>{
    const plataformas = await execAndCheck('GET_PLATAFORMAS_BY_TUTOR_ID', {tutorId:tutorId});
    if(plataformas){
        return plataformas;
    }
    return null;
}

module.exports = {
    getPlataformaById,
    getPlataformasByTutorId
}