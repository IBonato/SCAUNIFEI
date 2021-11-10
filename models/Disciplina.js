const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Disciplina = new Schema({
    name: {
        type: String,
        maxLength: 100
    },
    code: {
        type: String,
        maxLength: 20
    },
    ementa: {
        type: String
    },
    type: {
        type: String
    },
    modalidade: {
        type: String
    },
    tags: {
        type: Array
    },
    course: {
        type: String,
        maxLength: 10
    },
    institute: {
        type: String,
        maxLength: 100
    },
    teachers: [{
        type: Schema.Types.ObjectId,
        ref: "users"
    }],
    points: {
        type: Number
    },
    objectives: {
        type: String
    },
    content: {
        type: String
    },
    bibliography_basic: {
        type: String
    },
    bibliography_comp: {
        type: String
    },
    skills: {
        type: String
    },
    cover: {
        type: String,
        default: "../img/book.png"
    },
    added: {
        type: Date,
        default: Date.now()
    },
    folderid: {
        type: String
    }
})

mongoose.model("disciplinas", Disciplina)