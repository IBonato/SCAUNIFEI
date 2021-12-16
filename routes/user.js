// Load necessary modules
const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/User")
require("../models/Disciplina")
require("../models/Docente")
require("../models/Admin")
const User = mongoose.model("users")
const Disciplina = mongoose.model("disciplinas")
const Docente = mongoose.model("docentes")
const Admin = mongoose.model("admins")
const bcrypt = require("bcryptjs")
const { loggedin } = require("../helpers/loggedin")

//----------------------------------------------USER MANAGEMENT ROUTES-------------------------------------------------

// Route: logged user page
router.get("/", loggedin, (req, res) => {
    User.findOne({ _id: req.user._id }).lean().then(async (user) => {
        let title = 'SCAUNIFEI - Perfil de ' + user.name
        let docente = await Docente.find({ usuario: user._id }).lean().populate('disciplinas')
        let admin = await Admin.find({ usuario: user._id }).lean()
        res.render("layouts/user", { title: title, user: user, docente: docente, admin: admin })
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Houve um erro ao listar os dados do usuário!")
        res.redirect("/")
    })
});

// Route: user get edit page
router.get("/edit/:id", loggedin, (req, res) => {
    User.findOne({ _id: req.params.id }).lean().then((user) => {
        let title = 'SCAUNIFEI - Editar dados de ' + user.name
        res.render("layouts/user_edit", { title: title, user: user })
    }).catch((err) => {
        req.flash("error_msg", "Erro interno!")
        res.redirect("/user")
        console.log(err)
    })
});

// Route: user post edit photo
router.post("/edit/photo", loggedin, (req, res) => {
    var errors = []

    if (errors.length > 0)
        res.render("layouts/user", { errors: errors })
    else {
        User.findOne({ _id: req.body.id }).then((user) => {

            user.photourl = req.body.photourl

            user.save().then(() => {
                req.flash("success_msg", "Imagem do usuário alterada com sucesso!")
                res.redirect("/user")
            }).catch((err) => {
                console.log(err)
                req.flash("error_msg", "Erro interno ao salvar a imagem!")
                res.redirect("/user")
            })

        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Erro ao editar a imagem do usuário!")
            res.redirect("/user")
        })
    }
});

// Route: user post edit page
router.post("/edit/:id", loggedin, (req, res) => {
    var errors = []

    if (req.body.newpassword != req.body.cpassword) {
        req.flash("error_msg", "As senhas digitadas são diferentes, tente novamente!")
        errors.push()
    }

    if (errors.length > 0)
        res.render("layouts/user", { errors: errors })
    else {
        User.findOne({ _id: req.body.id }).then((user) => {

            if (req.body.name != user.name)
                user.name = req.body.name

            if (req.body.surname != user.surname)
                user.surname = req.body.surname

            if (req.body.email != user.email)
                user.email = req.body.email

            if (req.body.ra != user.ra)
                user.ra = req.body.ra

            if (req.body.institute != user.institute)
                user.institute = req.body.institute

            if (req.body.course != user.course)
                user.course = req.body.course

            if (req.body.gender != user.gender)
                user.gender = req.body.gender

            bcrypt.compare(req.body.oldpassword, user.password, (error, isequal) => {
                if (isequal) {
                    if (req.body.newpassword != '') {
                        bcrypt.genSalt(10, (erro, salt) => {
                            bcrypt.hash(req.body.newpassword, salt, (erro, hash) => {
                                if (erro) {
                                    req.flash("error_msg", "Houve um erro na checagem da senha antiga!")
                                    res.redirect("/user")
                                }

                                user.password = hash

                                user.save().then(() => {
                                    req.flash("success_msg", "Dados do usuário alterados com sucesso!")
                                    res.redirect("/user")
                                }).catch((err) => {
                                    console.log(err)
                                    req.flash("error_msg", "Erro interno ao salvar os dados do usuário!")
                                    res.redirect("/user")
                                })
                            })
                        })
                    }
                    else {
                        user.save().then(() => {
                            req.flash("success_msg", "Dados do usuário alterados com sucesso!")
                            res.redirect("/user")
                        }).catch((err) => {
                            console.log(err)
                            req.flash("error_msg", "Erro interno ao salvar os dados do usuário!")
                            res.redirect("/user")
                        })
                    }
                }
                else {
                    req.flash("error_msg", "Sua senha atual está incorreta!")
                    res.redirect("/user")
                }
            })
        }).catch((err) => {
            req.flash("error_msg", "Erro ao editar dados do usuário!")
            res.redirect("/user")
            console.log(err)
        })
    }
});

// Route: user delete account
router.post("/delete", loggedin, (req, res) => {
    Admin.findOneAndRemove({ usuario: req.body.id }).exec((err, admin) => {
        console.log('Registro de Admin excluído: ' + admin.usuario)
    })
    Docente.findOneAndRemove({ usuario: req.body.id }).exec((err, docente) => {
        console.log('Registro de Docente excluído: ' + docente.usuario)
        Disciplina.find({ teachers: docente._id }).exec((err, disciplina) => {
            for (let i = 0; i < disciplina.length; i++) {
                disciplina[i].teachers.pull({ _id: docente._id }) // remove teacher from disciplina history
                disciplina[i].save()
            }
        });
    });
    User.findOneAndRemove({ _id: req.body.id }).then((usuario) => {
        console.log('Registro de Usuário excluído: ' + usuario._id)
        req.flash("success_msg", "Usuário removido com sucesso!")
        res.redirect("/")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao remover o usuário!")
        res.redirect("/user")
        console.log(err)
    })
});

module.exports = router