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
    Disciplina.find().lean().sort({ code: '1' }).then((disciplinas) => {
        res.render("layouts/all", { disciplinas: disciplinas })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
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