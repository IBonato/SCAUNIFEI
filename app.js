// Loading necessary Modules
const express = require('express');
const expressHandlebars = require('express-handlebars');
const frameguard = require('frameguard')
const mongoose = require('mongoose')
const compression = require('compression')
const dotenv = require('dotenv')
const app = express()
const path = require('path')
const session = require('cookie-session')
const flash = require('connect-flash')
const passport = require("passport")
const db = require("./config/db")
require("./config/auth")(passport)

// Route files
const index = require("./routes/index")
const admin = require("./routes/admin")
const user = require("./routes/user")
const courses = require("./routes/courses")
const subjects = require("./routes/subjects")

// Configs:
dotenv.config()

// Session Creation -> Cookie lifetime: 6 hours
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        maxAge: 60 * 60 * 6
    }
}))

// Passport (Auth)
app.use(passport.initialize())
app.use(passport.session())

// Flash (Messages)
app.use(flash())

// Middlewares
//1 - Avoid embedding
app.use(frameguard({ action: 'sameorigin' }))

//2 - Defining Message Types
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg")
    res.locals.info_msg = req.flash("info_msg")
    res.locals.error_msg = req.flash("error_msg")
    res.locals.error = req.flash("error")
    res.locals.user = req.user || null;
    next()
})

//3 - Compress page text for optimization
app.use(compression())

//4 - Express (Routes)
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

//5 - Handlebars (Handle Pages)
app.engine('handlebars', expressHandlebars())
app.set('view engine', 'handlebars')

// Mongoose (Database Connection)
mongoose.Promise = global.Promise;
mongoose.connect(db.mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => {
    console.log("Connected to MongoDB")
}).catch((err) => {
    console.log("Error connecting to MongoDB: " + err)
})

// Static Content with 365 days cache
app.use(express.static(path.join(__dirname, "static"), {
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.handlebars') || path.endsWith('.js') || path.endsWith('.css')
            || path.endsWith('.png') || path.endsWith('.jpg') || path.endsWith('.ico') || path.endsWith('.woff')) {
            res.setHeader('Cache-Control', 'max-age=31536000');
        }
    },
}));

// Routes
// Main --> Secondary routes declared on each individual file
app.use('/', index)
app.use('/admin', admin)
app.use('/user', user)
app.use('/curso', courses)
app.use('/disciplina', subjects)

// Port declaration
const PORT = process.env.PORT || 8081 // Connection port
app.listen(PORT)