const { request, response } = require("express");
const { exec } = require("../database/database.controller");
const addUserToDb = async (tipoUsuario, nombre, email, region) => {
    let name = nombre.split(' ')[0]
    let apellido = nombre.split(' ')[1]
    if (tipoUsuario === 'tutor') {
        const inserccion = await exec('insertarTutor', { correo: email, apellido: apellido, primerNombre: name, region: region })
        if (inserccion.error) {
            console.log('Hubo un error al insertar tutor!')
        }

    }
    else {
        const inserccion = await exec('insertarTutorando', { correo: email, apellido: apellido, primerNombre: name, region: region })
        if (inserccion.error) {
            console.log('Hubo un error al insertar tutorando!')
        }
    }
}
const getUserFromDb = async (email) => {
    return null;
}

const showFormTutor = async (req, res) => {
    let retribuciones = await exec('GetRetribuciones', {})
    let modalidades = await exec('getModalidades', {})
    let sesiones = await exec('getTiposSesion', {})
    modalidades = modalidades.data.recordset
    sesiones = sesiones.data.recordset
    res.render('selectModalidad', { user: req.session.user, retribuciones: retribuciones.data.recordset, modalidades, sesiones })
}
const saveModalidadTutor = async (req, res) => {
    const { modalidad, tipo, selectpicker, maxEstud } = req.body
    const email = req.session.user.email
    const multiplesModalidades = (Array.isArray(modalidad));
    let insercion = ''
    if (multiplesModalidades) {
        for (let i = 0; i < modalidad.length; ++i) {
            insercion = await exec('insertModalidadTutor', { tutorEmail: email, modalidad: modalidad[i] })
        }

    }
    else {
        insercion = await exec('insertModalidadTutor', { tutorEmail: email, modalidad: modalidad })
    }
    if (insercion.error) {
        console.log('Error al insertar en modalidad_tutor')
        return false
    }
}

const saveTipoSesionTutor = async (req, res) => {
    const { tipo } = req.body
    const email = req.session.user.email
    const multiplesTipos = (Array.isArray(tipo));
    let insercion = ''
    if (multiplesTipos) {
        for (let i = 0; i < tipo.length; ++i) {
            insercion = await exec('insertTipoSesionTutor', { tutorEmail: email, tipoSesion: tipo[i] })
        }

    }
    else {
        insercion = await exec('insertTipoSesionTutor', { tutorEmail: email, tipoSesion: tipo })
    }
    if (insercion.error) {
        console.log('Error al insertar en tipoSesionTutor')
        return false
    }
}

const updateRetribucionTutor = async (req, res) => {
    const { selectPicker } = req.body;
    const email = req.session.user.email;

    let insercion = await exec('UpdateRetribucion', { tutorEmail: email, tipoRetribucion: selectPicker })
    if (insercion.error) {
        return false
    }
}
const updateMaxEstudiantes = async (req, res) => {
    const { maxEstud } = req.body
    const email = req.session.user.email
    let insercion = await exec('updateMaxEstud', { tutorEmail: email, maxEstud: maxEstud })
    if (insercion.error) {
        console.log('Error al actualizar la cantidad max de estudiantes')
        return false
    }
}
const saveParametrosTutor = async (req, res) => {
    saveModalidadTutor(req, res)
    saveTipoSesionTutor(req, res)
    updateRetribucionTutor(req, res)
    updateMaxEstudiantes(req, res)
    res.redirect('selectPlataforma')

}

const selectPlataforma = async (req, res) => {
    let plataformas = await exec('GET_ALL_PLATAFORMAS', {})
    if (plataformas.error) {
        console.log('Error en el S.P: GET_ALL_PLATAFORMAS')
    }
    else {
        res.render('Plataforma', { plataformas: plataformas.data.recordset })
    }
}

const savePlataformaTutor = async (req, res) => {
    const { email } = req.session.user
    const { plataforma } = req.body
    let insercion;
    if (Array.isArray(plataforma)) {
        for (let i = 0; i < plataforma.length; ++i) {
            insercion = await exec('insertPlataformaTutor', { email, plataforma: plataforma[i] })
        }
    }
    else {
        insercion = await exec('insertPlataformaTutor', { email, plataforma: plataforma })
    }
    if (!insercion.error) {
        console.log('Entrada insertada en plataformaTutor')
    }
    else {
        console.log('Error al insertar en plataformaTutot', insercion.error)
    }
    res.redirect('../dashboard')
}

const googleSignIn = async (req = request, res = response) => {
    const { name, email, img } = req.session.user
    const user = await getUserFromDb(email);
    if (!user) {
        const newUser = { name, email, img };
        res.status(201).json(newUser)
    }
    else {
        res.status(201).json(user)
    }
}

module.exports = {
    googleSignIn,
    addUserToDb,
    showFormTutor,
    saveParametrosTutor,
    selectPlataforma,
    savePlataformaTutor
}
