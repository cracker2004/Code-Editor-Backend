const mongoose = require("mongoose");

const jobSchema = mongoose.Schema({
    language: {
        type: String,
        required: true,
        enum: ["cpp", "py"],
    },

    filePath: {
        type: String,
        required: true,
    },

    submittedAt: {
        type: Date,
        default: Date.now,
    },

    startedAt: {
        type: Date,
    },

    completedAt: {
        type: Date,
    },

    output: {
        type: String,
    },

    status: {
        type: String,
        default: "pending",
        enum: ["pending", "success", "error"],
    }

})

const Job = new mongoose.model("job", jobSchema);

module.exports = Job;