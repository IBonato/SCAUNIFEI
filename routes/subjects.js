// Load necessary modules
const express = require('express')
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Docente")
require("../models/Disciplina")
const Docente = mongoose.model("docentes")
const Disciplina = mongoose.model("disciplinas")
const gdrive = require('../config/gdrive')
const formidable = require('formidable')
const path = require('path')
const { docente } = require("../helpers/loggedin")

//----------------------------------------------SUBJECT MANAGEMENT ROUTES-------------------------------------------------

// Route: all subjects
router.get("/todas", (req, res) => {
    Disciplina.find().lean().populate({
        path: "teachers", // populate teachers
        populate: {
            path: "usuario" // in teachers, populate usuario
        }
    }).sort({ code: '1' }).then((disciplinas) => {
        res.render("layouts/all", { disciplinas: disciplinas, title: 'SCAUNIFEI - Todas as disciplinas' })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as disciplinas!")
        res.redirect("/")
        console.log(err)
    })
});

// Route: add new subj docentes
router.get("/addsubj", docente, (req, res) => {
    Docente.find({ isActive: true }).lean().populate('usuario').sort({ name: '1' }).then((list) => {
        res.render("layouts/newsubj", { docente: list, title: 'SCAUNIFEI - Adicionar turma' })
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
        res.redirect("/disciplina/" + Id)
    }).catch((err) => {
        req.flash("error_msg", "Erro ao cadastrar disciplina, tente novamente")
        res.redirect("/disciplina/addsubj")
        console.log(err)
    })
});

// Route: subject page
router.get('/:id', (req, res) => {
    Disciplina.findOne({ _id: req.params.id }).lean().populate({
        path: "teachers", // populate teachers
        populate: {
            path: "usuario" // in teachers, populate usuario
        }
    }).then(async (disciplina) => {
        let title = 'SCAUNIFEI - ' + disciplina.name;
        let fileList = await gdrive.listFiles(disciplina.folderid);
        res.render("layouts/subject", { title: title, disciplina: disciplina, arquivo: fileList.files })
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

    form.parse(req, (err, fields, files) => {
        Docente.findOne({ usuario: req.user._id }).then(async (docente) => {
            if (docente.disciplinas.includes(fields.discid) == false) {
                req.flash("error_msg", "Você não pode enviar arquivos nessa disciplina, pois não é docente da mesma!")
                res.redirect('back')
            }
            else {
                await gdrive.fileUpload(files.nfile.originalFilename, files.nfile.filepath, files.nfile.mimetype, fields.folderid)
                req.flash("success_msg", "Arquivo carregado com sucesso!")
                res.redirect('back')
            }
        }).catch((err) => {
            req.flash("error_msg", "Ocorreu um erro ao enviar o arquivo!")
            res.redirect("back")
            console.log(err)
        })
    })
});

// Route: delete File
router.post("/deletefile", docente, async (req, res) => {
    Docente.findOne({ usuario: req.user._id }).then(async (docente) => {
        if (docente.disciplinas.includes(req.body.discid) == false) {
            req.flash("error_msg", "Você não pode excluir arquivos nessa disciplina, pois não é docente da mesma!")
            res.redirect('back')
        }
        else {
            try {
                await gdrive.deleteFile(req.body.fileid);
                req.flash("success_msg", "Arquivo excluído com sucesso!")
                res.redirect("back")
            } catch (err) {
                req.flash("error_msg", "Ocorreu um erro ao excluir o arquivo!")
                console.log(err)
            }
        }
    })
});

module.exports = router