const express = require('express');
const cors = require('cors');
const path = require('path');
const exphbs = require('express-handlebars');
const flash = require('express-flash');
const cookieParser = require('cookie-parser')
const loginRouter = require('../routes/login.routes');
const dashboardRouter = require('../routes/dashboard.routes');
const accountCreationRouter = require('../routes/accountCreation.routes')
const { dbConnection } = require('../database/config');
const sessions = require('express-session');
const logoutRouter = require('../routes/logout.routes');
const scheduleRouter = require('../routes/schedule.routes');
const reservationRouter = require('../routes/bookTutory.routes');
const incomeRouter = require('../routes/income.routes');
const adminRouter = require('../routes/admin.Routes')
const chatRouter = require('../routes/chat.routes');


class Server {
    constructor() {
        this.app = express();
        this.port = process.env.PORT || 8080;
        this.api = process.env.API || 'localhost';
        this.handlebars = exphbs.create({ helpers: this.loadHelpers() });
        require('dotenv').config()
        this.cookiesConfig();
        this.middlewares();
        this.loadViewEngineConfig();
        this.routes();
        this.dbConnection();
    }
    cookiesConfig() {
        const oneDay = 1000 * 60 * 60 * 24;

        //session middleware
        this.app.use(sessions({
            secret: process.env.COOKIE_SECRET,
            saveUninitialized: true,
            cookie: { maxAge: oneDay },
            resave: false
        }));

    }
    loadHelpers() {
        return {
            "ifTutor": function(role, options) {
                if (role === "tutor") {
                  return options.fn(this);
                }
              },
              "ifTutorando": function(role, options) {
                if (role === "tutorando") {
                  return options.fn(this);
                }
              },
              "foo":function(n,block){
                var accum = '';
                for(var i = 0; i < n; ++i)
                    accum += block.fn(this);
                return accum;
              }
        }
    }
    loadViewEngineConfig() {
        this.loadHelpers();
        this.app.engine('handlebars', this.handlebars.engine);
        this.app.set('view engine', 'handlebars');
        this.app.use(express.static('public'));
        this.app.get("/", (req, res) => {
            res.render('index', { title: 'Tutorías Cool', error: req.flash('error') });
        });
    }
    middlewares() {
        this.app.use(cors());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(express.json());
        this.app.use(flash());
        this.app.use(cookieParser());
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server listening in ${this.api}:${this.port}`);
        });
    }
    routes() {
        this.app.use('/login', loginRouter);
        this.app.use('/logout', logoutRouter)
        this.app.use('/dashboard', dashboardRouter)
        this.app.use('/creacionCuenta', accountCreationRouter)
        this.app.use('/seleccionar-horarios', scheduleRouter)
        this.app.use('/tutoria', reservationRouter);
        this.app.use('/ingresos', incomeRouter);
        this.app.use('/admin',adminRouter)
        this.app.use('/chat', chatRouter);
    }

    dbConnection() {
        return dbConnection();
    }
}

module.exports = {
    Server
}