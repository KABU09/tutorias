const { request, response } = require("express");
const { exec, execAndCheck } = require("../database/database.controller");
const { getTutorCurso } = require("../database/tutorCurso.controller");
const { searchOpenTutories } = require('../database/tutoria.controller')
const { getAllTutoriesByTutor, getAllTutoriesByTutorando, updateTutoryStatus } = require("../database/tutoria.controller");

const postFilter = async (req, res) => {
    const retribuciones = (req.body.retribuciones) ? Object.values(req.body.retribuciones).map(x => parseInt(x)) : null;
    const sesiones = (req.body.sesiones) ? Object.values(req.body.sesiones).map(x => parseInt(x)) : null;
    const regiones = (req.body.regiones) ? Object.values(req.body.regiones).map(x => parseInt(x)) : null;

    const cantidad = (req.body.cantidad) ? Object.values(req.body.cantidad).map(x => parseInt(x)) : null;
    const rating = (req.body.rating) ? parseInt(req.body.rating) : null;

    cantidad[1] = (cantidad[0] && cantidad[1] && cantidad[1] < cantidad[0]) ? cantidad[0] : cantidad[1]; //si cantidad[1] es menor que cantidad[0] entonces se asigna cantidad[0]

    let tutorCursoInformacionFiltro = await exec('getAvailableCoursesFilter', {});

    if (tutorCursoInformacionFiltro.error) {
        req.flash('error', 'Error al mostrar los cursos');
        return res.redirect('/dashboard/buscar-cursos');
    }
    else if (tutorCursoInformacionFiltro.isEmpty()) {
        req.flash('no-results', 'No hay resultados');
        return res.redirect('/dashboard/buscar-cursos');
    }


    tutorCursoInformacionFiltro = tutorCursoInformacionFiltro.data.recordset;
    tutorCursoInformacionFiltro = tutorCursoInformacionFiltro.filter(x => ((rating) ? (x.calificacion) ? x.calificacion >= rating : false : true) && ((retribuciones) ? retribuciones.includes(x.retribucionId) : true) && ((sesiones) ? sesiones.includes(x.tipoSesionId) : true) && ((regiones) ? regiones.includes(x.region) : true) && ((cantidad[0]) ? (x.cantidadTutoriasAgendadas) ? x.cantidadTutoriasAgendadas >= cantidad[0] : false : true) && ((cantidad[1]) ? (x.cantidadTutoriasAgendadas) ? x.cantidadTutoriasAgendadas <= cantidad[1] : false : true));


    tutorCursoInformacionFiltro = tutorCursoInformacionFiltro.filter((c, i, a) => a.findIndex(x => x.tutorCursoId === c.tutorCursoId) === i);

    if (!tutorCursoInformacionFiltro.length) {
        req.flash('no-results', 'No hay resultados que coincidan con el filtro (mostrando todos)');
        return res.redirect('/dashboard/buscar-cursos');
    }
    let queryIds = '';
    tutorCursoInformacionFiltro.forEach(x => queryIds += `id=${x.tutorCursoId}&`);

    res.redirect(`/dashboard/buscar-cursos?${queryIds}`);
}

const estado = {
    pendiente: { name: 'Pendiente', id: 1 },
    aceptada: { name: 'Aceptada', id: 2 },
    rechazada: { name: 'Rechazada', id: 3 },
    finalizada: { name: 'Finalizada', id: 4 }
}

const updateStatusMode = {
    confirm: 'confirm',
    deny: 'deny'
}

const searchCourse = async (req = request, res = response) => {
    const { user } = req.session;
    const search = req.query.search
    try {
        let [sesiones, retribuciones, regiones] = await Promise.all([
            await exec('getTiposSesion', {}),
            await exec('GetRetribuciones', {}),
            await exec('GetRegiones', {})
        ])

        sesiones = (sesiones.error || sesiones.isEmpty()) ? null : sesiones.data.recordset;
        retribuciones = (retribuciones.error || retribuciones.isEmpty()) ? null : retribuciones.data.recordset;
        regiones = (regiones.error || regiones.isEmpty()) ? null : regiones.data.recordset;

        const filteredCoursesIds = (req.query.id) ? (Array.isArray(req.query.id) ? req.query.id : new Array(req.query.id)) : null;
        if (filteredCoursesIds) {
            let filteredCourses = await Promise.all(filteredCoursesIds.map(id => getTutorCurso(id)));
            return res.render('buscarCurso', { title: 'Buscar curso', user, matchedCourses: filteredCourses, noResults: req.flash('no-results'), error: req.flash('error'), sesiones, retribuciones, regiones });
        }

        let [matchedCourses, openTutories] = await Promise.all([
            await searchCourseInDb(search ? search : ''),
            await searchOpenTutories(search ? search : '')
        ])

        if (!matchedCourses) {
            req.flash('error', 'Error al mostrar los cursos');
        } else if (matchedCourses === 'empty') {
            req.flash('no-results', 'No hay resultados');
            matchedCourses = null;
        }

        if (retribuciones.error || sesiones.error || regiones.error) {
            req.flash('error', 'Error al cargar los filtros');
        }

        matchedCourses = matchedCourses.map(x => {
            calificacion = Math.floor(x.calificacion);
            return { ...x, calificacion }
        });

        res.render('buscarCurso', { title: 'Buscar curso', user, matchedCourses, openTutories, noResults: req.flash('no-results'), error: req.flash('error'), sesiones, retribuciones, regiones });

    }
    catch (err) {
        req.flash('error', 'Error al cargar los filtros');
        res.redirect('/dashboard');
    }
}

const searchCourseForResource = async (req = request, res = response) => {
    const { user } = req.session;
    const search = req.query.search

    let matchedCourses = await exec('getAllCourses', { pattern: `${search ? `%${search}%` : `%`}` });

    if (matchedCourses.error) {
        req.flash('error', 'Error al mostrar los cursos');
        matchedCourses = null;
    }
    else if (matchedCourses.isEmpty()) {
        req.flash('no-results', 'No se encontraron resultados');
        matchedCourses = null;
    }
    else {
        matchedCourses = matchedCourses.data.recordset;
    }
    res.render('buscarCursoResource', { title: 'Buscar curso', user, matchedCourses, noResults: req.flash('no-results') });
}

const searchCourseInDb = async (searchFilter) => {
    const courses = await exec('GetAvailableCourses', { pattern: `%${searchFilter}%` })
    if (courses.error) {
        console.log('Error in query: searchCourseInDb');
        return null;
    }
    if (courses.isEmpty()) {
        return 'empty';
    }
    return courses.data.recordset;

}



const showAllCourses = async (req, res, err = 0) => {
    if (err == 1) {
        req.flash('error', 'Ya usted registró ese curso')
    }
    const search = req.query.search
    let courses = {};
    if (search) {
        courses = await exec('getAllCourses', { pattern: `%${search}%` });
        if (courses.error) {
            req.flash('error', 'Error al obtener los cursos. Intente más tarde');
            courses = null;
        }
        else if (courses.isEmpty()) {
            req.flash('warning', 'No hay coincidencias');
            courses = null;
        } else {
            courses = courses.data.recordset;
        }
    }
    else {
        courses = await exec('getAllCourses', { pattern: '%' })
        if (courses.error) {
            req.flash('error', 'Error al obtener los cursos. Intente más tarde');
            courses = null;
        }
        else if (courses.isEmpty()) {
            req.flash('warning', 'No hay cursos disponibles');
            courses = null;
        } else {
            courses = courses.data.recordset;
        }
    }
    res.render('select', { user: req.session.user, cursos: courses, error: req.flash('error'), warning: req.flash('warning') })

}
const saveCursosImpartir = async (req, res) => {
    let errorInsercion = 0;
    const { email } = req.session.user
    const cursos = req.body.curso
    const multiplesCursos = (Array.isArray(cursos));
    if (multiplesCursos) {
        for (let i = 0; i < cursos.length; ++i) {
            let existeTupla = await exec('existeTutorCurso', { correo: email, curso: cursos[i] })
            if (existeTupla.data.recordset.length > 0) {
                errorInsercion = 1;
                break;
            }
            else {
                let insercion = await exec('insertarTutorCurso', { tutorEmail: email, cursoName: cursos[i], ano: 2021, periodo: 1 })
            }
        }
    }
    else {
        let existeTupla = await exec('existeTutorCurso', { correo: email, curso: cursos })
        if (existeTupla.data.recordset.length > 0) {
            errorInsercion = 1;
        }
        else {
            let insercion = await exec('insertarTutorCurso', { tutorEmail: email, cursoName: cursos, ano: 2021, periodo: 1 })
        }
    }
    if (errorInsercion) {
        showAllCourses(req, res, errorInsercion);
    }
    else {
        res.redirect('/dashboard')
    }
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

const agregarRecurso = async (req, res) => {
    let errorAgregar = false;
    let { resourceName, resourceLink, curso } = req.query

    let insercion = await exec('addRecurso', { path: resourceLink, email: req.session.user.email, nombre: resourceName, cursoId: curso })
    if (insercion.error) {
        console.log('Error al añadir el recurso')
        errorAgregar = true;
    }
    return errorAgregar;
}
const mostrarRecursos = async (req, res) => {
    let { resourceName, curso } = req.query
    if (resourceName) {
        let errorAgregar = await agregarRecurso(req, res)
        if (errorAgregar) {
            req.flash('error', 'Ese recurso ya fue agregado previamente')
        }
    }
    let recursos = await exec('GetAllRecursos', { cursoId: curso })
    if (recursos.error) {
        console.log('Error al mostrar recursos')
    }
    else {
        recursos.data.recordset.forEach((recurso) => {
            let fullName = recurso.primerNombre + recurso.apellido
            Object.assign(recurso, { fullName: fullName })
        })
    }
    let isAdmin = ''
    if (req.session.user.role == 'Admin') {
        isAdmin = 'whateverString'
    }
    res.render('recursos', { isAdmin, user: req.session.user, recursos: recursos.data.recordset, error: req.flash('error'), warning: req.flash('warning'), curso })
}

const getMyTutories = async (req = request, res = response) => {
    let acceptedTutories = null;
    let pendingTutories = null;
    let deniedTutories = null;
    let finalizedTutories = null;

    const estadoTutorias = req.query.estadoTutorias || estado.aceptada.name;

    const filter = {}

    if (req.session.user.role === "Tutor") {
        const tutorId = req.session.user.tutorId;

        pendingTutories = await getAllTutoriesByTutor(tutorId, estado.pendiente.id);
        acceptedTutories = await getAllTutoriesByTutor(tutorId, estado.aceptada.id);
        deniedTutories = await getAllTutoriesByTutor(tutorId, estado.rechazada.id);
        finalizedTutories = await getAllTutoriesByTutor(tutorId, estado.finalizada.id);
    }
    else if (req.session.user.role === "Tutorando") {

        const tutorandoId = req.session.user.tutorandoId;

        pendingTutories = await getAllTutoriesByTutorando(tutorandoId, estado.pendiente.id);
        acceptedTutories = await getAllTutoriesByTutorando(tutorandoId, estado.aceptada.id);
        deniedTutories = await getAllTutoriesByTutorando(tutorandoId, estado.rechazada.id);
        finalizedTutories = await getAllTutoriesByTutorando(tutorandoId, estado.finalizada.id);

    }

    let role = req.session.user.role.toLowerCase();
    let roleTutorando = (role === 'tutorando') || undefined;
    let roleTutor = (role === 'tutor') || undefined;
    let roleAdmin = (role === 'admin') || undefined;

    const userRole = {tutor:roleTutor, tutorando:roleTutorando, admin:roleAdmin};
    res.render('dashboard',
        {
            title: 'Initial dashboard',
            user: req.session.user,
            acceptedTutories,
            pendingTutories,
            deniedTutories,
            finalizedTutories,
            userRole,
            error: req.flash('error'),
            warning: req.flash('warning'),
            success: req.flash('success')
        });
}

const administrarPerfil = async (req, res) => {
    let regiones = await exec('GetRegiones', {})
    let firstName = await exec('getNombreByCorreo', { Correo: req.session.user.email })
    let apellido = await exec('getApellidoByCorreo', { Correo: req.session.user.email })
    firstName = firstName.data.recordset[0].primerNombre
    apellido = apellido.data.recordset[0].apellido
    if (Object.keys(req.query).length > 0) {
        let initialEmail = req.session.user.email
        let { nombre, apellido, selectpicker } = req.query
        let update = await exec('updatePersonalInfo', { PrimerNombre: nombre, apellido, region: selectpicker, initialEmail })
        if (update.error) {
            req.flash('error', 'No fue posible actualizar la información en la base de datos')
            console.log('Error al updatear datos')
        }
        else {
            req.flash('success', 'Los datos han sido actualizados correctamente!')
            return res.redirect('/dashboard');
        }
    }
    res.render('administrar', { user: req.session.user, error: req.flash('error'), warning: req.flash('warning'), success: req.flash('success'), region: regiones.data.recordset, firstName, apellido })
}
const filterUnchecked = (checked, todas) => {
    let arr = []
    if (checked.length == 0) {
        return todas;
    }
    todas.forEach(item => {
        let esta = false;
        checked.forEach(itemChecked => {
            if (item.nombre == itemChecked.NOMBRE) {
                esta = true;
            }
        })
        if (!esta) {
            arr.push(item)
        }
    });
    return arr;
}
const cambiarParametros = async (req, res, message = "") => {
    let modalidades = await exec('getModalidades', {})
    let sesiones = await exec('getTiposSesion', {})
    let modalidadesChecked = await exec('getModalidadesTutor', { Correo: req.session.user.email })
    let modalidadesUnchecked = filterUnchecked(modalidadesChecked.data.recordset, modalidades.data.recordset)
    let sesionesChecked = await exec('getSesionesTutor', { Correo: req.session.user.email })
    let sesionesUnchecked = filterUnchecked(sesionesChecked.data.recordset, sesiones.data.recordset)
    let costoHoraPersona = (await exec('getCostoIndividual', { Correo: req.session.user.email })).data.recordset[0]
    let incrementoTarifaIndividual = (await exec('getCostoIncrementos', { Correo: req.session.user.email })).data.recordset[0]
    let costoHoraGrupal = (await exec('getCostoGrupal', { Correo: req.session.user.email })).data.recordset[0]
    let incrementoTarifaGrupal = (await exec('getCostoGrupalInc', { Correo: req.session.user.email })).data.recordset[0]
    let retribuciones = (await exec('GetRetribuciones', {})).data.recordset
    if (message.length == 1) {
        res.render('cambiarParametros', { user: req.session.user, modalidadesUnchecked, sesionesUnchecked, modalidadesChecked: modalidadesChecked.data.recordset, sesionesChecked: sesionesChecked.data.recordset, costoHoraPersona, incrementoTarifaIndividual, costoHoraGrupal, incrementoTarifaGrupal, retribuciones })
    }
    else if (message == 'error') {
        req.flash('error', 'Ha ocurrido un error al actualizar sus datos')
        res.render('cambiarParametros', { error: req.flash('error'), user: req.session.user, modalidadesUnchecked, sesionesUnchecked, modalidadesChecked: modalidadesChecked.data.recordset, sesionesChecked: sesionesChecked.data.recordset, costoHoraPersona, incrementoTarifaIndividual, costoHoraGrupal, incrementoTarifaGrupal, retribuciones })

    }
    else if (message == 'success') {
        req.flash('success', 'Se han actualizado sus datos correctamente')

        res.render('cambiarParametros', { success: req.flash('success'), user: req.session.user, modalidadesUnchecked, sesionesUnchecked, modalidadesChecked: modalidadesChecked.data.recordset, sesionesChecked: sesionesChecked.data.recordset, costoHoraPersona, incrementoTarifaIndividual, costoHoraGrupal, incrementoTarifaGrupal, retribuciones })

    }
}


const guardarParametros = async (req, res) => {
    let { selectPicker, modalidad, tipo, costoHoraPersona, incrementoTarifaIndividual, costoHoraGrupal, incrementoTarifaGrupal } = req.body
    let insercionCostos = await exec('insertarCostos', { Correo: req.session.user.email, costoHoraPersona, incrementoTarifaIndividual, costoHoraGrupal, incrementoTarifaGrupal })
    if (insercionCostos.error) {
        console.log('Error al insertar en la base de datos')
    }
    let message = 'success'
    let updateModalidad;
    if (modalidad) {
        await exec('deleteOldModalidades', { Correo: req.session.user.email })
    }
    if (tipo) {
        await exec('deleteOldTipos', { Correo: req.session.user.email })
    }
    if (Array.isArray(modalidad)) {
        for (let i = 0; i < modalidad.length; ++i) {
            updateModalidad = await exec('insertModalidadTutor', { tutorEmail: req.session.user.email, modalidad: modalidad[i] })
            if (updateModalidad.error) {
                break;
            }
        }
    }
    else {
        updateModalidad = await exec('insertModalidadTutor', { tutorEmail: req.session.user.email, Modalidad: modalidad })
    }
    if (updateModalidad.error) {
        message = 'error'
    }
    let updateTipo;
    if (Array.isArray(tipo)) {
        for (let i = 0; i < tipo.length; ++i) {
            updateTipo = await exec('insertTipoSesionTutor', { tutorEmail: req.session.user.email, TipoSesion: tipo[i] })
            if (updateTipo.error) {
                console.log('Error al updatear tipo_sesion_tutor')
                break;
            }
        }
    }
    else {
        updateTipo = await exec('insertTipoSesionTutor', { tutorEmail: req.session.user.email, TipoSesion: tipo })
    }
    if (updateTipo.error) {
        message = 'error'
    }
    let updateRet = await exec('UpdateRetribucion', { tutorEmail: req.session.user.email, tipoRetribucion: selectPicker })
    if (updateRet.error) {
        message = 'error'
    }
    cambiarParametros(req, res, message)

}

const showInstructions = async (req = request, res = response) => {
    const role = req.query.role;
    return res.render('index', { role, title: 'Tutorías Cool' });
}


const updateTutory = async (req = request, res = response) => {

    const tutoriaId = req.body.tutoriaId;
    const mode = req.query.mode;
    if (!tutoriaId || !mode) {
        req.flash('error', "Error al cambiar estado de la tutoria");
        return res.status(404).send({});
    }
    let tutory;
    if (mode === updateStatusMode.confirm) {
        tutory = await updateTutoryStatus(tutoriaId, estado.aceptada.name);
    }
    else if (mode === updateStatusMode.deny) {
        tutory = await updateTutoryStatus(tutoriaId, estado.rechazada.name);
    }
    if (!tutory) {
        req.flash('error', "Error al cambiar estado de la tutoria");
        return res.status(404).send({});
    }
    req.flash('success', "Se cambió el estado de la tutoría exitosamente");
    return res.send({ tutory });
}

const eliminarRecurso = async (req, res) => {
    let { name, curso } = req.query
    let borrado = await exec("eliminarRecurso", { cursoId: curso, nombre: name })
    if (borrado.error) {
        console.log('Ocurrió un error al eliminar el recurso')
    }
    else {
        console.log('El recurso ha sido eliminado de manera exitosa')
    }
    res.redirect('recursos?curso=' + curso)
}

const editarRecurso = async (req, res) => {
    const { user } = req.session;
    let { name, curso, message } = req.query
    if (typeof (message) != 'undefined') {
        req.flash('success', 'El recurso ha sido editado de manera correcta')
    }
    let resource = (await exec('getSpecificResource', { cursoId: curso, nombre: name })).data.recordset[0]
    res.render('edicionRecurso', { user, resource, curso, success: req.flash('success') })
}

async function actualizarRecurso(req,res){
    let {newName,path, oldName, curso}=req.body
    let update=await exec('updateResource',{oldName,newName,path,cursoId:curso})
    let message=''
    if(!update.error){
        message="success"
    }
    else {
        message = 'error'
    }
    res.redirect('editarRecurso?message=' + message)
}
module.exports = {
    searchCourse,
    showAllCourses,
    saveCursosImpartir,
    mostrarRecursos,
    selectPlataforma,
    getMyTutories,
    searchCourseForResource,
    administrarPerfil,
    cambiarParametros,
    guardarParametros,
    showInstructions,
    postFilter,
    updateTutory,
    eliminarRecurso,
    editarRecurso,
    actualizarRecurso
}