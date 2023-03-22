const isTutor = async (role='') => {
    return role.toLowerCase() === 'tutor';
}

const isTutorando = async (role='') => {
    return role.toLowerCase() === 'tutorando';
}

module.exports = {
    isTutor,
    isTutorando
}