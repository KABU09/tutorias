const schedules = ['0:00', '0:30', '1:00', '1:30', '2:00', '2:30', '3:00', '3:30', '4:00', '4:30', '5:00', '5:30', '6:00', '6:30', '7:00', '7:30', '8:00', '8:30', '9:00', '9:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30', '22:00', '22:30', '23:00', '23:30'];

const setEndTime = () => {
    const selectStart = document.getElementById('startTime');
    const selectEnd = document.getElementById('endTime');
    selectEnd.options.length = 0;
    for (let s of schedules.slice(schedules.indexOf(selectStart.value) + 1)) {
        let option = document.createElement('option');
        option.value = s;
        option.innerHTML = s;
        selectEnd.appendChild(option);
    }
}

const deleteSchedule = async(event) => {
    const id = event.target.parentElement.parentElement.getAttribute('data-value'); 
    const response = await fetch(`${location.origin}/seleccionar-horarios`, {
        method: 'DELETE',
        headers: {'Content-Type': 'application/json'},
        redirect: 'manual',
        body: JSON.stringify({id: id})
    })
    .then(response => {
        window.location.href = response.url
    })
    .catch(err => console.log(err));
}

setEndTime();