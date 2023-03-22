const formatDatetime = (fechaToParse)=>{
    if(!fechaToParse){
        return null;
    }
    const date = new Date(fechaToParse);
    return date.toLocaleDateString('es', { dateStyle: 'medium', timeStyle: 'medium', timeZone: 'Etc/UTC' });
}

module.exports = {
    formatDatetime
}