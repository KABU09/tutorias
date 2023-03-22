const { request, response } = require("express");
const { exec } = require("../database/database.controller");

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
const verUsuarios = async(req,res)=>{
    const user=req.session.user
    let tutores= (await exec('getAllTutores',{}))
    if(!tutores.error){
        tutores=tutores.data.recordset
        tutores.forEach(element=>{
            element.region=capitalizeFirstLetter(element.region.toLowerCase())
        })
    }
    let tutorandos = (await exec('getAllTutorandos',{}))
    if(!tutorandos.error){
      tutorandos=tutorandos.data.recordset
      tutorandos.forEach(element => {
          element.region=capitalizeFirstLetter(element.region.toLowerCase())
      });
    }
    res.render("listaUsuarios",{title:"Lista de usuarios",user,tutores,tutorandos})
}


const mantenimientoCursos = async(req,res)=>{
    const user=req.session.user;
    let cursos= await exec('getAllCourses',{pattern: '%'})
    if(!cursos.error){
        cursos=cursos.data.recordset
    }
    else{
        req.flash('error','Ha ocurrido un error a la hora de cargar los cursos')
    }
    res.render("adminCursos",{title:"Mantenimiento de cursos",user,cursos,error:req.flash('error')})
}

const addCurso = async(req,res)=>{
    let {nombreCurso,sigla}=req.query
    console.log(nombreCurso)
    if(nombreCurso=='' || sigla==''){
        req.flash('error','Ha ocurrido un error al añadir el nuevo curso')
        return res.redirect("mantenimientoCursos")
    }
    let insercion = await exec('ADDCURSO',{nombre:nombreCurso,sigla})
    if(!insercion.error){
        req.flash('success','Se ha añadido el curso exitosamente')
        return res.redirect('../dashboard')
    }
    else{
        req.flash('error','Ha ocurrido un error al añadir el nuevo curso')
        return res.redirect("mantenimientoCursos")
    }
}

const editarCurso = async(req,res)=>{
    let user=req.session.user
    let cursoId = req.query.id
    let detallesCurso= await exec('getCourseDetails',{cursoId})
    if(!detallesCurso.error){
        detallesCurso=detallesCurso.data.recordset[0]
    }
    else{
        req.flash('error','Ocurrio un error al recuperar la informacion del curso')
    }
    res.render('editarCurso',{cursoId,user,detallesCurso,title:"Edición de curso"})
}

const actualizarCurso=async(req,res)=>{
    let {newName,sigla,cursoId,descripcion}=req.body
    let update = await exec('updateCurso',{cursoId,newName,sigla,descripcion})
    if(!update.error){
        req.flash('success','Se ha actualizado el curso correctamente')
    }
    else{
        req.flash('error','Ha ocurrido un error a la hora de actualizar el curso')
    }
    return res.redirect('../dashboard')
}
module.exports={
    verUsuarios,
    mantenimientoCursos,
    addCurso,
    editarCurso,
    actualizarCurso
}