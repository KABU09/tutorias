const sql = require('mssql');

const isEmpty = function(){
    try{
        return this.data.recordset.length === 0;
    }
    catch {
        return true;
    }
}

const exec = async (sp, input) => {
    const result = {};
    try {
        const pool = await sql.connect();
        const request = await pool.request();
        if (input){
            Object.entries(input).map(i => request.input(i[0], i[1]));
        }
        result.data = await request.execute(sp);

    } catch (err) {
        result.error = err;
    }
    result.isEmpty = isEmpty;
    return result;
}

const execAndCheck = async (storeProcedureName, inputParams, errorMessage) => {
    const result = await exec(storeProcedureName, inputParams);

    if (result.error) {
        console.log(`execAndCheck ${errorMessage}: ${result.error}`);
        return null;
    }
    if (result.isEmpty()) {
        return null;
    }

    return result.data.recordset;
}


module.exports = {
    exec,
    execAndCheck
}