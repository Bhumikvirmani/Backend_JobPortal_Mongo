import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { getAdminJobs, getAllJobs, getJobById, postJob } from "../controllers/job.controller.js";

const router = express.Router();

// Add a test endpoint to check if the API is working
router.route("/test").get((req, res) => {
    return res.status(200).json({
        message: "Job API is working correctly",
        success: true
    });
});

router.route("/post").post(isAuthenticated, postJob);
router.route("/get").get(getAllJobs); // Public endpoint for job listings
router.route("/getadminjobs").get(isAuthenticated, getAdminJobs);
router.route("/get/:id").get(getJobById); // Made public for job details page

export default router;

