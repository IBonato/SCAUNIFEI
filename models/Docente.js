const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Docente = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    disciplinas: [{
        type: Schema.Types.ObjectId,
        ref: "disciplinas"
    }],
    isActive:
    {
        type: Boolean,
        default: false
    }
})

mongoose.model("docentes", Docente)