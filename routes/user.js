// Load necessary modules
const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/User")
const User = mongoose.model("users")
const bcrypt = require("bcryptjs")
const moment = require("moment")
const { loggedin } = require("../helpers/loggedin")

//----------------------------------------------USER MANAGEMENT ROUTES-------------------------------------------------

// Route: logged user page
router.get("/", loggedin, (req, res) => {
    User.find().lean().then((users) => {
        res.render("layouts/user", { users: users })
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Houve um erro ao listar os dados do usuário!")
        res.redirect("/")
    })
});

// Route: user get edit page
router.get("/edit/:id", loggedin, (req, res) => {
    User.findOne({ _id: req.params.id }).lean().then((user) => {
        let birthday = moment(user.birthday).utc().format("YYYY-MM-DD")
        res.render("layouts/user_edit", { user: user, birthday: birthday })
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

            if (req.body.birthday != user.birthday)
                user.birthday = req.body.birthday

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
    User.findOneAndRemove({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Usuário removido com sucesso!")
        res.redirect("/")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao remover o usuário!")
        res.redirect("/user")
        console.log(err)
    })
});

module.exports = router