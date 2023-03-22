//set max month to current month
var today = new Date();
var month = today.getMonth() + 1;
var year = today.getFullYear();
document.getElementById("month").setAttribute("max", year + "-" + month);
document.getElementById("month").setAttribute("value", year + "-" + month);