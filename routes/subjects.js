// Load necessary modules
const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/User")
require("../models/Disciplina")
const User = mongoose.model("users")
const Disciplina = mongoose.model("disciplinas")
const gdrive = require('../config/gdrive')
const formidable = require('formidable')
const path = require('path')
const { docente } = require("../helpers/loggedin")

//----------------------------------------------SUBJECT MANAGEMENT ROUTES-------------------------------------------------

// Route: all subjects
router.get("/todas", (req, res) => {
    Disciplina.find().lean().populate('teachers').sort({ code: '1' }).then((disciplinas) => {
        res.render("layouts/all", { disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: add new subj docentes
router.get("/addsubj", docente, (req, res) => {
    User.find({ docente: true }).lean().sort({ name: '1' }).then((list) => {
        res.render("layouts/newsubj", { users: list })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar os dados dos professores!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: add new subj for docentes
router.post("/addsubj", docente, async (req, res) => {
    let folderName = req.body.code + '.' + req.body.teachers[0]
    let folderId = await gdrive.createFolder(folderName);

    const newDisciplina = new Disciplina({
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

    newDisciplina.save().then(() => {
        req.flash("success_msg", "Disciplina cadastrada com sucesso!")
        res.redirect("/disciplina/" + req.body.code)
    }).catch((err) => {
        req.flash("error_msg", "Erro ao cadastrar disciplina, tente novamente")
        res.redirect("/disciplina/addsubj")
        console.log(err)
    })
});

// Route: subject page
router.get('/:code', (req, res) => {
    Disciplina.findOne({ code: req.params.code }).lean().populate('teachers').then(async (disciplina) => {
        let fileList = await gdrive.listFiles(disciplina.folderid);
        res.render("layouts/subject", { disciplina: disciplina, arquivo: fileList.files })
    }).catch((err) => {
        res.redirect("/404")
        console.log(err)
    })
});

// Route: add new File
router.post("/addfile", docente, (req, res) => {
    const tempFolder = path.join(__dirname, "../files/ephemeral");
    const form = new formidable.IncomingForm();
    form.uploadDir = tempFolder;

    form.parse(req, async (err, fields, files) => {
        if (err)
            console.log(err);
        else {
            await gdrive.fileUpload(files.nfile.originalFilename, files.nfile.filepath, files.nfile.mimetype, fields.folderid)
            req.flash("success_msg", "Arquivo carregado com sucesso!")
            res.redirect('back')
        }
    });
});

// Route: delete File
router.post("/deletefile", docente, async (req, res) => {
    try {
        await gdrive.deleteFile(req.body.fileid);
        req.flash("success_msg", "Arquivo excluído com sucesso!")
        res.redirect("back")
    } catch (err) {
        req.flash("error_msg", "Ocorreu um erro ao excluir o arquivo!")
        console.log(err)
    }
});

module.exports = router