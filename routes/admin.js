// Load necessary modules
const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Admin")
require("../models/User")
require("../models/Disciplina")
require("../models/Docente")
const Admin = mongoose.model("admins")
const User = mongoose.model("users")
const Disciplina = mongoose.model("disciplinas")
const Docente = mongoose.model("docentes")
const gdrive = require('../config/gdrive');
const bcrypt = require("bcryptjs")
const async = require('async')
const { isAdmin } = require("../helpers/loggedin")

//----------------------------------------------ADMIN MANAGEMENT ROUTES-------------------------------------------------

// Route: admin main page
router.get("/", isAdmin, (req, res) => {
    res.render("layouts/admin/landing", { title: 'SCAUNIFEI - Portal do Administrador' })
});

// Route: user list page
router.get("/userslist", isAdmin, (req, res) => {
    Docente.find().lean().populate('usuario').sort({ isActive: '1' }).then((list) => {
        res.render("layouts/admin/user_list", { title: 'SCAUNIFEI - Gerenciar usuários', item: list })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os dados dos usuários!")
        res.redirect("/admin")
        console.log(err)
    })
});

// Route: subject list page
router.get("/subjectslist", isAdmin, (req, res) => {
    var doclist;
    var sublist;
    async.series([
        (callback) => {
            Docente.find({ isActive: true }, (err, docentes) => {
                if (err) {
                    res.redirect("/admin")
                    return callback(err);
                }
                doclist = docentes;
                callback(null, docentes);
            }).lean().populate('usuario')
        },
        (callback) => {
            Disciplina.find({}, (err, disciplinas) => {
                if (err) {
                    res.redirect("/admin")
                    return callback(err);
                }
                sublist = disciplinas;
                callback(null, disciplinas);
            }).lean().sort({ name: '1' }).populate({
                path: "teachers", // populate teachers
                populate: {
                    path: "usuario" // in teachers, populate usuario
                }
            })
        }],
        (err) => {
            res.render("layouts/admin/subject_list", { title: 'SCAUNIFEI - Gerenciar disciplinas', docentes: doclist, disciplinas: sublist })
        });
});

// Route: add user modal
router.post("/adduser", isAdmin, (req, res) => {
    User.findOne({ email: req.body.email, ra: req.body.ra }).then((user) => {
        if (user) {
            req.flash("error_msg", "Já existe uma conta com esse e-mail ou RA cadastrada!")
            res.redirect("/admin/userslist")
        }
        else {
            let Id = mongoose.Types.ObjectId();
            const newUser = new User({
                _id: Id,
                name: req.body.name,
                surname: req.body.surname,
                email: req.body.email,
                ra: req.body.ra,
                institute: req.body.institute,
                course: req.body.course,
                birthday: req.body.birthday,
                gender: req.body.gender,
                password: '@Sca' + req.body.ra
            })

            const newDocente = new Docente({
                usuario: Id,
                isActive: req.body.docente
            });
            const newAdmin = new Admin({
                usuario: Id
            });

            bcrypt.genSalt(10, (erro, salt) => {
                bcrypt.hash(newUser.password, salt, (err, hash) => {
                    if (err) {
                        req.flash("error_msg", "Ocorreu um erro no salvamento do usuário!")
                        res.redirect("/admin/userslist")
                        console.log(err)
                    }

                    newUser.password = hash
                    newDocente.save();
                    newAdmin.save();
                    newUser.save().then(() => {
                        req.flash("success_msg", "Usuário cadastrado com sucesso!")
                        res.redirect("/admin/userslist")
                    }).catch((err) => {
                        req.flash("error_msg", "Erro ao cadastrar usuário, tente novamente!")
                        res.redirect("/admin/userslist")
                        console.log(err)
                    })
                })
            })
        }
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu um erro interno.")
        res.redirect("/admin/userslist")
        console.log(err)
    })
});

// Route: add subj modal
router.post("/addsubj", isAdmin, async (req, res) => {
    let folderName = req.body.code + '.' + req.body.teachers[0]
    let folderId = await gdrive.createFolder(folderName);
    let Id = mongoose.Types.ObjectId();

    const newDisciplina = new Disciplina({
        _id: Id,
        name: req.body.name,
        code: req.body.code,
        points: req.body.points,
        institute: req.body.institute,
        course: req.body.course,
        type: req.body.type,
        modalidade: req.body.modalidade,
        teachers: req.body.teachers,
        tags: req.body.tags.split(','),
        ementa: req.body.ementa,
        objectives: req.body.objectives,
        content: req.body.content,
        bibliography_basic: req.body.bibliography_basic,
        bibliography_comp: req.body.bibliography_comp,
        skills: req.body.skills,
        cover: req.body.cover,
        folderid: folderId
    })

    let teachers = req.body.teachers.filter((teacher) => {
        return teacher != 000000000000000000000000;
    })

    for (let i = 0; i < teachers.length; i++) {
        Docente.findOne({ _id: teachers[i] }).exec((err, docente) => {
            if (docente.disciplinas.includes(Id) == false) {
                docente.disciplinas.push(Id)
                docente.save()
            }
        });
    }

    newDisciplina.save().then(() => {
        req.flash("success_msg", "Disciplina cadastrada com sucesso!")
        res.redirect("/admin/subjectslist")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao cadastrar disciplina, tente novamente")
        res.redirect("/admin/subjectslist")
        console.log(err)
    })
});

// Route: user post edit
router.post("/editusr", isAdmin, (req, res) => {
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

        Docente.findOne({ usuario: req.body.id }).then((docente) => {
            docente.isActive = req.body.docente
            docente.save()
        });

        user.save().then(() => {
            req.flash("success_msg", "Dados do usuário alterados com sucesso!")
            res.redirect("/admin/userslist")
        }).catch((err) => {
            req.flash("error_msg", "Erro interno ao salvar os dados do usuário!")
            res.redirect("/admin/userslist")
            console.log(err)
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao editar dados do usuário!")
        res.redirect("/admin/userslist")
        console.log(err)
    })
});

// Route: user post edit
router.post("/editsubj", isAdmin, (req, res) => {
    Disciplina.findOne({ _id: req.body.id }).then((disciplina) => {

        if (req.body.name != disciplina.name)
            disciplina.name = req.body.name

        if (req.body.code != disciplina.code)
            disciplina.code = req.body.code

        if (req.body.ementa != disciplina.ementa)
            disciplina.ementa = req.body.ementa

        if (req.body.type != disciplina.type)
            disciplina.type = req.body.type

        if (req.body.modalidade != disciplina.modalidade)
            disciplina.modalidade = req.body.modalidade

        disciplina.teachers = req.body.teachers

        disciplina.tags = req.body.tags.split(',')

        if (req.body.course != disciplina.course)
            disciplina.course = req.body.course

        if (req.body.institute != disciplina.institute)
            disciplina.institute = req.body.institute

        if (req.body.points != disciplina.points)
            disciplina.points = req.body.points

        if (req.body.objectives != disciplina.objectives)
            disciplina.objectives = req.body.objectives

        if (req.body.content != disciplina.content)
            disciplina.content = req.body.content

        if (req.body.bibliography_basic != disciplina.bibliography_basic)
            disciplina.bibliography_basic = req.body.bibliography_basic

        if (req.body.bibliography_comp != disciplina.bibliography_comp)
            disciplina.bibliography_comp = req.body.bibliography_comp

        if (req.body.skills != disciplina.skills)
            disciplina.skills = req.body.skills

        if (req.body.cover != disciplina.cover)
            disciplina.cover = req.body.cover

        for (let i = 0; i < req.body.teachers.length; i++) {
            Docente.findOne({ _id: req.body.teachers[i] }).exec((err, docente) => {
                if (docente.disciplinas.includes(req.body.id) == false) {
                    docente.disciplinas.push(req.body.id)
                    docente.save()
                }
            });
        }

        disciplina.save().then(() => {
            req.flash("success_msg", "Dados da disciplina alterados com sucesso!")
            res.redirect("/admin/subjectslist")
        }).catch((err) => {
            req.flash("error_msg", "Erro interno ao salvar os dados da disciplina!")
            res.redirect("/admin/subjectslist")
            console.log(err)
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao editar dados da disciplina!")
        res.redirect("/admin/subjectslist")
        console.log(err)
    })
});

// Route: delete user account
router.post("/deleteusr", isAdmin, (req, res) => {
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
        req.flash("success_msg", "Usuário excluído com sucesso!")
        res.redirect("/admin/userslist")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao excluir o usuário!")
        res.redirect("/admin/userslist")
        console.log(err)
    })
});

// Route: delete subject
router.post("/deletesubj", isAdmin, (req, res) => {
    Docente.find({ disciplinas: req.body.id }).exec((err, docente) => {
        for (let i = 0; i < docente.length; i++) {
            docente[i].disciplinas.pull({ _id: req.body.id }) // remove disciplina from teacher history
            docente[i].save()
            console.log('Disciplina (' + req.body.id + ') removida do docente: ' + docente[i]._id)
        }
    });
    Disciplina.findOneAndRemove({ _id: req.body.id }).then(async () => {
        await gdrive.deleteFolder(req.body.folderid);
        req.flash("success_msg", "Disciplina excluída com sucesso!")
        res.redirect("/admin/subjectslist")
    }).catch((err) => {
        req.flash("error_msg", "Erro ao excluir a disciplina!")
        res.redirect("/admin/subjectslist")
        console.log(err)
    })
});

module.exports = router