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
        type: Number,
        unique: true,
        maxLength: 10
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
    admin: {
        type: Boolean,
        default: false
    },
    docente: {
        type: Boolean,
        default: false
    }
})

mongoose.model("users", User)