const { exec } = require("../database/database.controller");
const { getTutoriaPopulate } = require("../database/tutoria.controller");

const showIncome = async (req, res) => {
    res.render('income', { user: req.session.user, error: req.flash('error'), warning: req.flash('warning'), success: req.flash('success') });
}

const postIncome = async (req, res) => {
    if (!req.body.monthYear) {
        req.flash('error', 'Error al obtener los ingresos');
        return res.redirect('/ingresos');
    }

    const { monthYear } = req.body;

    //check if monthYear is less or equal than current month
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const monthYearArray = monthYear.split('-');
    const year = monthYearArray[0];
    const month = monthYearArray[1];

    if (parseInt(month) > currentMonth || parseInt(year) > currentYear) {
        req.flash('error', 'Error, no se pueden mostrar los ingresos del futuro');
        return res.redirect('/ingresos');
    }

    let tutorias = await exec('getIncomePerMonth', { date: `${monthYear}%`, tutorId: req.session.user.tutorId });

    if (tutorias.error) {
        req.flash('error', 'Error al obtener los ingresos');
        return res.redirect('/ingresos');
    } else if (tutorias.isEmpty()) {
        req.flash('warning', 'No hay ingresos para este mes');
        return res.redirect('/ingresos');
    } else {
        tutorias = tutorias.data.recordset;
    }

    tutorias = await Promise.all(tutorias.map(t => getTutoriaPopulate(t.id)));

    tutorias.map(t => {
        {t, t.tutoriaFechaInicial = `${new Date(t.tutoriaFechaInicial).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short', timeZone: 'Etc/UTC' })}`, t.tutoriaFechaFinal = `${new Date(t.tutoriaFechaFinal).toLocaleString('es', { timeStyle: 'short', timeZone: 'Etc/UTC' })}`}
    });

    //sum all incomes
    const totalIncome = tutorias.reduce((acc, t) => acc + t.costoTotal, 0);

    //convert month int to month name
    let monthName = new Date(`${monthYear}-1`).toLocaleString('es', { month: 'long' });

    //uppercase first letter of month name
    monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
    res.render('income', { error: req.flash('error'), warning: req.flash('warning'), success: req.flash('success'), user: req.session.user, tutorias, totalIncome, monthName });
}
module.exports = {
    showIncome,
    postIncome
}