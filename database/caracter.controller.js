const { execAndCheck } = require("./database.controller");

const getCaracterById = async(id)=>{
    const caracter = await execAndCheck('GET_CARACTER_BY_ID', {id:id}, `Error al obtener caracter por id ${id}`);
    if(caracter){
        return caracter[0];
    }
    return null;
}

const getCaracteres = async () => {
    return await execAndCheck('GET_CARACTER',
        {},
        'Error al obtener caracteres');
}

module.exports = {
    getCaracterById,
    getCaracteres
}

