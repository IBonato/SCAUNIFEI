// Configs
const localStrategy = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

// Models
require("../models/Admin")
require("../models/User")
require("../models/Docente")
const Admin = mongoose.model("admins")
const User = mongoose.model("users")
const Docente = mongoose.model("docentes")

// Checking if the inputs match user stored data
module.exports = function (passport) {
    passport.use(new localStrategy({ usernameField: 'email', passwordField: 'password' }, (email, password, done) => {
        User.findOne({ email: email }).then((user) => {
            if (!user) {
                return done(null, false, { message: "Esta conta não existe!" })
            }
            else {
                bcrypt.compare(password, user.password, async (err, isequal) => {
                    if (isequal) {
                        let admin = await Admin.findOne({ usuario: user._id }).select({ _id: 0, isAdmin: 1 })
                        let docente = await Docente.findOne({ usuario: user._id }).select({ _id: 0, isActive: 1 })
                        user = await User.findOneAndUpdate({ _id: user._id }, { $set: { admin: admin.isAdmin, docente: docente.isActive } }, { overwrite: true })
                        return done(null, user)
                    }
                    else {
                        return done(null, false, { message: "Senha incorreta!" })
                    }
                })
            }
        })
    }))
    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user)
        }).lean()
    })
}
