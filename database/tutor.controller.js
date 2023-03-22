const { execAndCheck } = require("./database.controller");

const getTutor = async (userId) => {
    const tutor = await execAndCheck('GET_TUTOR', { id: userId },
        'Error al obtener tutor');
    if (tutor) {
        return tutor[0];
    }
    else {
        return null;
    }
}

module.exports = {
    getTutor
}