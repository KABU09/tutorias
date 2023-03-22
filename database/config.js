const sql = require('mssql');
const dbConnection = async () => {

    const sqlConfig = {
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DATABASE,
        server: `${process.env.SQL_HOST}`,
        port: Number(process.env.SQL_PORT),
        options: {
            trustServerCertificate: true
        }
    }

    try{
        await sql.connect(sqlConfig);
        console.log(`Connected via Host: ${process.env.SQL_HOST} with User: ${process.env.SQL_USER} on Port: ${process.env.SQL_PORT}`);
    } catch (err) {
        throw new Error(err)
    }
}

module.exports = {
    dbConnection
}