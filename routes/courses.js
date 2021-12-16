// Load necessary modules
const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Disciplina")
const Disciplina = mongoose.model("disciplinas")

// Route: Basic subjects
router.get("/base", (req, res) => {
    Disciplina.find({ course: 'Base' }).lean().populate({
        path: "teachers", // populate teachers
        populate: {
            path: "usuario" // in teachers, populate usuario
        }
    }).sort({ code: '1' }).then((disciplinas) => {
        res.render("layouts/courses/basicas", { title: 'SCAUNIFEI - Disciplinas básicas', disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: ECO subjects
router.get("/eco", (req, res) => {
    Disciplina.find({ course: 'ECO' }).lean().populate({
        path: "teachers", // populate teachers
        populate: {
            path: "usuario" // in teachers, populate usuario
        }
    }).sort({ code: '1' }).then((disciplinas) => {
        res.render("layouts/courses/eco", { title: 'SCAUNIFEI - ECO', disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: EEL subjects
router.get("/eel", (req, res) => {
    Disciplina.find({ course: 'EEL' }).lean().populate({
        path: "teachers", // populate teachers
        populate: {
            path: "usuario" // in teachers, populate usuario
        }
    }).sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/eel", { title: 'SCAUNIFEI - EEL', disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: EAM subjects
router.get("/eam", (req, res) => {
    Disciplina.find({ course: 'EAM' }).lean().populate({
        path: "teachers", // populate teachers
        populate: {
            path: "usuario" // in teachers, populate usuario
        }
    }).sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/eam", { title: 'SCAUNIFEI - EAM', disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: EMB subjects
router.get("/emb", (req, res) => {
    Disciplina.find({ course: 'EMB' }).lean().populate({
        path: "teachers", // populate teachers
        populate: {
            path: "usuario" // in teachers, populate usuario
        }
    }).sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/emb", { title: 'SCAUNIFEI - EMB', disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: ECA subjects
router.get("/eca", (req, res) => {
    Disciplina.find({ course: 'ECA' }).lean().populate({
        path: "teachers", // populate teachers
        populate: {
            path: "usuario" // in teachers, populate usuario
        }
    }).sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/eca", { title: 'SCAUNIFEI - ECA', disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: EMT subjects
router.get("/emt", (req, res) => {
    Disciplina.find({ course: 'EMT' }).lean().populate({
        path: "teachers", // populate teachers
        populate: {
            path: "usuario" // in teachers, populate usuario
        }
    }).sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/emt", { title: 'SCAUNIFEI - EMT', disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: EPR subjects
router.get("/epr", (req, res) => {
    Disciplina.find({ course: 'EPR' }).lean().populate({
        path: "teachers", // populate teachers
        populate: {
            path: "usuario" // in teachers, populate usuario
        }
    }).sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/epr", { title: 'SCAUNIFEI - EPR', disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: ESS subjects
router.get("/ess", (req, res) => {
    Disciplina.find({ course: 'ESS' }).lean().populate({
        path: "teachers", // populate teachers
        populate: {
            path: "usuario" // in teachers, populate usuario
        }
    }).sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/ess", { title: 'SCAUNIFEI - ESS', disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: EME subjects
router.get("/eme", (req, res) => {
    Disciplina.find({ course: 'EME' }).lean().populate({
        path: "teachers", // populate teachers
        populate: {
            path: "usuario" // in teachers, populate usuario
        }
    }).sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/eme", { title: 'SCAUNIFEI - EME', disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: All courses
router.get("/todos_cursos", (req, res) => {
    res.render("layouts/courses/courses", { title: 'SCAUNIFEI - Cursos' })
});

module.exports = router