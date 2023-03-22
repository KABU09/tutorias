const {Server} = require('./Models/Server.model')

const main = async()=>{
    const server = new Server();
    server.listen();
}
main();
