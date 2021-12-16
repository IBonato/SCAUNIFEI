const mongoose = require("mongoose")
const Schema = mongoose.Schema

const Admin = new Schema({
    usuario: {
        type: Schema.Types.ObjectId,
        ref: "users"
    },
    isAdmin:
    {
        type: Boolean,
        default: false
    }
})

mongoose.model("admins", Admin)