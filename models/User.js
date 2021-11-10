const mongoose = require("mongoose")
const Schema = mongoose.Schema

const User = new Schema({
    name: {
        type: String,
        maxLength: 30
    },
    surname: {
        type: String,
        maxLength: 50
    },
    email: {
        type: String,
        unique: true,
        maxLength: 50
    },
    ra: {
        type: String,
        unique: true,
        maxLength: 10
    },
    birthday: {
        type: String
    },
    course: {
        type: String,
        maxLength: 50
    },
    institute: {
        type: String,
        maxLength: 50
    },
    gender: {
        type: String,
        maxLength: 10,
        default: "Outro"
    },
    password: {
        type: String
    },
    photourl: {
        type: String,
        default: "../img/avatar.png"
    },
    resetPasswordToken: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    docente: {
        type: Boolean,
        default: false
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
})

mongoose.model("users", User)