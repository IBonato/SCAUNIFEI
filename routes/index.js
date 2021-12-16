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
const bcrypt = require("bcryptjs")
const crypto = require('crypto')
const passport = require("passport")
const path = require('path')
const async = require('async')
const gmail = require('../config/gmail')

//----------------------------------------------MAIN ROUTES---------------------------------------------

// Route: main page
router.get("/", (req, res) => {
    var lastadded;
    async.series([
        (callback) => {
            Disciplina.find({}, (err, disciplinas) => {
                if (err) {
                    res.redirect("/")
                    return callback(err);
                }
                lastadded = disciplinas;
                callback(null, disciplinas);
            }).lean().sort({ added: 'desc' }).limit(8)
        }],
        (err) => {
            res.render("layouts/index", { lastadded: lastadded, title: 'SCAUNIFEI' })
        });
});

// Route: Google Search Verification
router.get('/google6c1459ba30ec5812.html', function (req, res) {
    res.sendFile(path.join(__dirname, "../", 'google6c1459ba30ec5812.html'));
});

// Route: course PPC
router.get('/ler/:file(*)', function (req, res) {
    var file = req.params.file;
    res.sendFile(path.join(__dirname, "../files/ppc", file));
});

// Route: error 404
router.get("/404", (req, res) => {
    res.render("layouts/404", { title: 'SCAUNIFEI - Erro 404' })
});

// Route: about
router.get("/sobre", (req, res) => {
    res.render("layouts/about", { title: 'SCAUNIFEI - Sobre' })
});

// Route: Login
router.post("/", (req, res, next) => {
    passport.authenticate("local", {
        successRedirect: req.session.returnTo || "/",
        failureRedirect: "/",
        failureFlash: true
    })(req, res, next)
    delete req.session.returnTo
});

// Route: Logout
router.get("/logout", (req, res) => {
    req.logout()
    req.flash('info_msg', "Deslogado com sucesso!")
    res.redirect("/")
});

//--------------------------------------------------REGISTER ROUTE-----------------------------------------------------

// Route: register new user
router.get("/registro", (req, res) => {
    res.render("layouts/register", { title: 'SCAUNIFEI - Registro' })
});

// Route: receive data from register
router.post("/registro", (req, res) => {

    var errors = []
    if (req.body.password != req.body.cpassword) {
        req.flash("error_msg", "As senhas digitadas são diferentes, tente novamente!")
        errors.push()
    }

    if (errors.length > 0)
        res.render("layouts/register", { errors: errors })
    else {
        User.findOne({ email: req.body.email }).then((user) => {
            if (user) {
                req.flash("error_msg", "Já existe uma conta com esse e-mail cadastrada!")
                res.redirect("/registro")
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
                    gender: req.body.gender,
                    password: req.body.password
                })
                if (req.body.photourl != "") {
                    newUser.photourl = req.body.photourl
                }

                const newDocente = new Docente({ usuario: Id });
                const newAdmin = new Admin({ usuario: Id });
                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(newUser.password, salt, (erro, hash) => {
                        if (erro) {
                            req.flash("error_msg", "Ocorreu um erro no salvamento do usuário!")
                            res.redirect("/registro")
                        }
                        newUser.password = hash

                        newDocente.save();
                        newAdmin.save();
                        newUser.save().then(() => {
                            req.flash("success_msg", "Usuário cadastrado com sucesso!")
                            res.redirect("/")
                        }).catch((err) => {
                            console.log(err)
                            req.flash("error_msg", "Erro ao cadastrar usuário, tente novamente!")
                            res.redirect("/registro")
                        })
                    })
                })
            }
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Ocorreu um erro interno.")
            res.redirect("/")
        })
    }
});

//--------------------------------------------------FORGOT PASSWORD ROUTE---------------------------------------------

// Route: forgot password get
router.get("/forgot", (req, res) => {
    res.render("layouts/forgot", { title: 'SCAUNIFEI - Esqueci Minha Senha' })
});

// Route: forgot password post
router.post('/forgot', async (req, res,) => {
    const { email } = req.body;

    crypto.randomBytes(20, (err, buf) => {
        global.usrtoken = buf.toString('hex')
    });

    User.findOne({ email }, (err, user) => {
        if (!user) {
            console.log(err)
            req.flash("error_msg", "Não existe uma conta com o endereço de e-mail informado!")
            return res.redirect('/forgot')
        }
        else {
            user.resetPasswordToken = global.usrtoken;
            user.resetPasswordExpires = Date.now() + 7200000; // 2 hours
            user.save();
            global.usr = user;
        }
    });

    if (global.usr) {
        try {
            const transport = await gmail.createTransporter()

            let sendMail = await transport.sendMail({
                to: global.usr.email,
                from: 'SCA UNIFEI <sgaunifei@gmail.com>',
                replyTo: 'sgaunifei@gmail.com',
                subject: 'SCAUNIFEI - Recuperar Senha',
                text: 'Olá ' + global.usr.name + ' ' + global.usr.surname + ',\n\n' +
                    'Você está recebendo esse e-mail, porque você (ou alguém) requisitou a recuperação da senha de sua conta.\n\n' +
                    'Por favor clique no link a seguir, ou cole ele em seu navegador para completar o processo:\n\n' +
                    'https://' + req.headers.host + '/reset/' + global.usrtoken + '\n\n' +
                    'Obs.: esse link tem validade de 2 horas, após esse período será necessário fazer uma nova requisição para recuperar sua senha.\n\n' +
                    'Se você não requisitou essa mudança, por favor ignore esse email e sua senha permanecerá a mesma.\n'
            });
            req.flash('info_msg', 'Um e-mail foi enviado para ' + global.usr.email + ', com as instruções para recuperar a senha.');
            res.redirect('/');
        } catch (err) {
            req.flash('error_msg', 'Erro ao enviar e-mail.');
            res.redirect('/forgot');
            console.log(err);
        }
    }
});

// Route: reset password get
router.get("/reset/:token", (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        if (!user) {
            req.flash('error_msg', 'O token de recuperação de senha é inválido ou está expirado!');
            return res.redirect('/forgot');
        }
        res.render('layouts/reset', { token: req.params.token, title: 'SCAUNIFEI - Resetar Senha' });
    }).lean();
});

// Route: reset password post
router.post("/reset/:token", async (req, res) => {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(req.body.newpassword, salt, (err, hash) => {

                user.password = hash
                user.resetPasswordToken = undefined
                user.resetPasswordExpires = undefined

                user.save()
                global.resusr = user
            })
        })
    })

    try {
        const transport = await gmail.createTransporter();

        let sendMail = await transport.sendMail({
            to: global.resusr.email,
            from: 'SCA UNIFEI <sgaunifei@gmail.com>',
            replyTo: 'sgaunifei@gmail.com',
            subject: 'SCAUNIFEI - Senha Alterada',
            text: 'Olá ' + global.resusr.name + ' ' + global.resusr.surname + ',\n\n' +
                'Você está recebendo esse e-mail, porque a senha de sua conta (' + global.resusr.email + ') foi alterada.\n\n' +
                'Se você não requisitou essa mudança, por favor entre em https://' + req.headers.host + '/forgot/ para recuperar sua senha.\n'
        });

        req.flash('success_msg', 'Sua senha foi alterada com sucesso!');
        res.redirect("/")
    } catch (err) {
        req.flash('error_msg', 'Erro ao alterar sua senha.');
        res.redirect('/forgot');
        console.log(err);
    }
});

//----------------------------------------------SEARCH ROUTE-----------------------------------------------------------

// For the search query
function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// Route: subject search
router.get('/busca', (req, res) => {
    if (req.query.search) {
        const regex = new RegExp(escapeRegex(req.query.search), 'gi');
        const termo = req.query.search;
        const title = 'SCAUNIFEI - Busca ' + termo;
        Disciplina.find({ "$or": [{ code: regex }, { name: regex }, { institute: regex }, { tags: regex }, { content: regex }] }).lean().populate({
            path: "teachers", // populate teachers
            populate: {
                path: "usuario" // in teachers, populate usuario
            }
        }).sort({ code: '1' }).then((disciplinas) => {
            if (disciplinas.length < 1) {
                Disciplina.find().lean().populate({
                    path: "teachers", // populate teachers
                    populate: {
                        path: "usuario", // in teachers, populate usuario
                        match: { "name": { "$in": regex } }
                    }
                }).sort({ code: '1' }).then((disciplinas) => {
                    disciplinas = disciplinas.filter((disc) => {
                        disc.teachers = disc.teachers.filter((teacher) => {
                            return teacher.usuario != null;
                        })
                        return disc.teachers.length > 0;
                    })
                    if (disciplinas.length < 1) {
                        req.flash("info_msg", "Nenhuma disciplina corresponde ao termo pesquisado, tente novamente.")
                        res.redirect("back")
                    }
                    else {
                        res.render("layouts/search", { title: title, disciplinas: disciplinas, termo: termo })
                    }
                }).catch((err) => {
                    req.flash("error_msg", "Ocorreu um erro ao pesquisar pelas disciplinas!")
                    res.redirect("back")
                    console.log(err)
                })
            }
            else {
                res.render("layouts/search", { title: title, disciplinas: disciplinas, termo: termo })
            }
        }).catch((err) => {
            req.flash("error_msg", "Ocorreu um erro ao pesquisar pelas disciplinas!")
            res.redirect("back")
            console.log(err)
        })
    }
});

module.exports = router