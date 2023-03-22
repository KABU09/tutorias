const { execAndCheck } = require("./database.controller");

const getEstadoTutoriaById = async(id)=>{
    const estadoTutoria = await execAndCheck('GET_ESTADO_TUTORIA', {id:id}, 'Error al obtener estado tutoria');
    if(estadoTutoria){
        return estadoTutoria[0];
    }
    return null;
}

module.exports = {
    getEstadoTutoriaById
}