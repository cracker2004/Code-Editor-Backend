const express = require("express");
const cors = require("cors");
const { generateFile } = require("./generateFile");
const { executeCpp } = require("./executeCpp");
const { executePy } = require("./executePy");
const mongoose = require("mongoose");
const Job = require("./Modals/Job");

const connectDB = async () => {
    try {
        const connect = await mongoose.connect('mongodb://127.0.0.1:27017/test');
        console.log("Database Connected");
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}
connectDB();
const app = express();

app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get("/status", async (req, res) => {
    const jobId = req.query.id;
    // console.log("status requested ", jobId);

    if (jobId == undefined) {
        res.status(400).json({ success: "false", error: "missing jobId" })
    }

    try {
        const job = await Job.findById(jobId);
        if(job === null){
            res.status(404).json({success: "false", err: "Invalid Job Id"})
        }
        res.status(200).json({ success: "true", job });
    } catch (err) {
        res.status(400).json({ success: "false", error: JSON.stringify(err) })
    }
})

app.post("/run", async (req, res) => {
    const { language, code } = req.body;
    if (!code) {
        return res.status(400).json({ success: false, error: "Cannot pass empty code" })
    }
    let job;
    try {

        const filePath = await generateFile(language, code);

        job = await new Job({ language, filePath }).save();
        const jobId = job["_id"];
        console.log(job);

        res.status(201).json({ success: "true", jobId })

        let output;

        job["startedAt"] = new Date();

        if (language == "cpp") {
            output = await executeCpp(filePath);
        }
        else {
            output = await executePy(filePath);
        }

        job["status"] = "success";
        job["completedAt"] = new Date();
        job["output"] = output;
        await job.save();

        // return res.json({ filePath, output });
        console.log(job)    ;
    } catch (err) {
        job["completedAt"] = new Date();
        job["status"] = "error";
        job["output"] = JSON.stringify(err)
        await job.save();
        // res.status(500).json({ err })
        console.log(job);
    }

})


app.listen(5000, () => { console.log("Server started successfully on port 5000!") })