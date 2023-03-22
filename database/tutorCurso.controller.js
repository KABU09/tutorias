const { execAndCheck } = require("./database.controller");
const { getCaracteres } = require("../database/caracter.controller");
const { getModalidadesByTutorId } = require("../database/modalidad.controller");
const { getRetribucion } = require("../database/retribucion.controller");
const { getTipoSesionByTutorId, getTiposSesionByTutorId } = require("../database/tipoSession.controller");
const { getTutor } = require("../database/tutor.controller");
const { getPlataformasByTutorId } = require("./plataforma.controller");


const getTutorCurso = async (tutorCursoId) => {

    const tutorCurso = await execAndCheck('GET_TUTOR_CURSO_INFO', { tutorCursoId: tutorCursoId },
        'Error al obtener tutorCurso');
    if (tutorCurso) {
        return tutorCurso[0]
    } else {
        return null;
    }
}

const getTutorCourseInformacion = async (tutorCursoId) => {
    if (!tutorCursoId) {
        console.log('There is no tutorCursoId');
    }

    const tutorCursoInformation = await getTutorCurso(tutorCursoId);
    const tutorId = tutorCursoInformation.tutorId;
    const userId = tutorCursoInformation.usuarioId;
    const modalidades = await getModalidadesByTutorId(tutorId);
    const tiposSesion = await getTiposSesionByTutorId(tutorId);
    const caracteres = await getCaracteres();
    const tutor = await getTutor(userId);
    const retribucionId = tutor.retribucionId;
    const retribucion = await getRetribucion(retribucionId);
    const plataformas = await getPlataformasByTutorId(tutorId);

    const tutorCouseInformation = {
        tutorCursoInformation,
        modalidades,
        tiposSesion,
        caracteres,
        tutor,
        retribucion,
        plataformas
    }

    return tutorCouseInformation;

}

module.exports = {
    getTutorCurso,
    getTutorCourseInformacion
}