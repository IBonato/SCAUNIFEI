const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Comentario = new Schema({
    title: {
        type: String,
        maxLength: 200
    },
    content: {
        type: String
    }, user: {
        type: Schema.Types.ObjectId,
        ref: "users",
        required: true
    },
    added: {
        type: Date,
        default: Date.now()
    }
})

mongoose.model("comentarios", Comentario)