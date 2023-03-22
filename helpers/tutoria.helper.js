const tutoryFormatDatetime = (tutoria)=>{
    if(tutoria.tutoriaFechaInicial){
        const date = new Date(tutoria.tutoriaFechaInicial);
        tutoria.tutoriaFechaInicial = date.toLocaleDateString('es', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Etc/UTC' });
    }
    if(tutoria.tutoriaFechaFinal){
        const date = new Date(tutoria.tutoriaFechaFinal);
        tutoria.tutoriaFechaFinal = date.toLocaleDateString('es', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Etc/UTC' });
    }
    return tutoria;
}

const tutoryFormatDatetimeByProps = (tutoria, {fechaInicialField='', fechaFinalField=''})=>{
    if(tutoria[fechaInicialField]){
        const date = new Date(tutoria[fechaInicialField]);
        tutoria[fechaInicialField] = date.toLocaleDateString('es', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Etc/UTC' });
    }
    if(tutoria[fechaFinalField]){
        const date = new Date(tutoria[fechaFinalField]);
        tutoria[fechaFinalField] = date.toLocaleDateString('es', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Etc/UTC' });
    }
    return tutoria;
}

module.exports = {
    tutoryFormatDatetime,
    tutoryFormatDatetimeByProps
}