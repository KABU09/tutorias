const { execAndCheck } = require("./database.controller");

const getRetribucion = async (retribucionId) => {
    if (!retribucionId) {
        console.log('No se encontro el id de retribucion del tutor');
        return null;
    }

    const retribucion = await execAndCheck('GET_RETRIBUCION', { id: retribucionId },
        'Error al obtener retribucion',
        '/dashboard');
    if (retribucion) {
        return retribucion[0];
    }
    else {
        return null;
    }
}

module.exports = {
    getRetribucion
}