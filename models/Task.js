const mongoose = require("mongoose");
const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        require: true
    },
    description: {
        type: String
    },
    completed: {
        type: Boolean,
        default:false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Taks = mongoose.model("Taks",taskSchema);
module.exports=Task;