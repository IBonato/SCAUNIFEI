// Load necessary modules
const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Disciplina")
const Disciplina = mongoose.model("disciplinas")

// Route: Basic subjects
router.get("/base", (req, res) => {
    Disciplina.find({ course: 'Base' }).lean().populate('teachers').sort({ code: '1' }).then((disciplinas) => {
        res.render("layouts/courses/basicas", { disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: ECO subjects
router.get("/eco", (req, res) => {
    Disciplina.find({ course: 'ECO' }).lean().populate('teachers').sort({ code: '1' }).then((disciplinas) => {
        res.render("layouts/courses/eco", { disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: EEL subjects
router.get("/eel", (req, res) => {
    Disciplina.find({ course: 'EEL' }).lean().populate('teachers').sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/eel", { disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: EAM subjects
router.get("/eam", (req, res) => {
    Disciplina.find({ course: 'EAM' }).lean().populate('teachers').sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/eam", { disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: EMB subjects
router.get("/emb", (req, res) => {
    Disciplina.find({ course: 'EMB' }).lean().populate('teachers').sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/emb", { disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: ECA subjects
router.get("/eca", (req, res) => {
    Disciplina.find({ course: 'ECA' }).lean().populate('teachers').sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/eca", { disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: EMT subjects
router.get("/emt", (req, res) => {
    Disciplina.find({ course: 'EMT' }).lean().populate('teachers').sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/emt", { disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: EPR subjects
router.get("/epr", (req, res) => {
    Disciplina.find({ course: 'EPR' }).lean().populate('teachers').sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/epr", { disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: ESS subjects
router.get("/ess", (req, res) => {
    Disciplina.find({ course: 'ESS' }).lean().populate('teachers').sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/ess", { disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: EME subjects
router.get("/eme", (req, res) => {
    Disciplina.find({ course: 'EME' }).lean().populate('teachers').sort({ name: '1' }).then((disciplinas) => {
        res.render("layouts/courses/eme", { disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: All courses
router.get("/todos_cursos", (req, res) => {
    res.render("layouts/courses/courses")
});

module.exports = router