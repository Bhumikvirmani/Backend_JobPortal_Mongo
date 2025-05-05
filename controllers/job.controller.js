import { Job } from "../models/job.model.js";

// admin post krega job
export const postJob = async (req, res) => {
    try {
        console.log("POST /job/post - Request body:", req.body);
        console.log("User ID from token:", req.id);

        const { title, description, requirements, salary, location, jobType, experience, position, companyId } = req.body;
        const userId = req.id;

        if (!userId) {
            console.log("Authentication error: No user ID in request");
            return res.status(401).json({
                message: "Authentication failed. Please log in again.",
                success: false
            });
        }

        // Validate required fields
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            console.log("Validation error: Missing required fields");
            return res.status(400).json({
                message: "Something is missing. All fields are required.",
                missingFields: !title ? "title" : !description ? "description" : !requirements ? "requirements" :
                               !salary ? "salary" : !location ? "location" : !jobType ? "jobType" :
                               !experience ? "experience" : !position ? "position" : "companyId",
                success: false
            });
        }

        console.log("Creating job with data:", {
            title, description, requirements, salary, location, jobType,
            experience, position, companyId, userId
        });

        try {
            // Log the data types for debugging
            console.log("Data types:", {
                title: typeof title,
                description: typeof description,
                requirements: typeof requirements,
                salary: typeof salary,
                location: typeof location,
                jobType: typeof jobType,
                experience: typeof experience,
                position: typeof position,
                companyId: typeof companyId,
                userId: typeof userId
            });

            const job = await Job.create({
                title,
                description,
                requirements: requirements.split(","),
                salary: Number(salary),
                location,
                jobType,
                experienceLevel: String(experience), // Ensure it's a string
                position: Number(position), // Ensure it's a number
                company: companyId,
                created_by: userId
            });

            console.log("Job created successfully:", job._id);
            return res.status(201).json({
                message: "New job created successfully.",
                job,
                success: true
            });
        } catch (dbError) {
            console.log("Database error creating job:", dbError);
            return res.status(500).json({
                message: "Error creating job in database",
                error: dbError.message,
                success: false
            });
        }
    } catch (error) {
        console.log("Server error in postJob:", error);
        return res.status(500).json({
            message: "Server error while creating job",
            error: error.message,
            success: false
        });
    }
}
// student k liye
export const getAllJobs = async (req, res) => {
    try {
        console.log("GET /job/get - Query params:", req.query);
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ]
        };

        console.log("Searching jobs with query:", query);
        const jobs = await Job.find(query).populate({
            path: "company"
        }).sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            console.log("No jobs found matching the query");
            return res.status(404).json({
                message: "Jobs not found.",
                success: false
            });
        }

        console.log(`Found ${jobs.length} jobs matching the query`);
        return res.status(200).json({
            jobs,
            success: true
        });
    } catch (error) {
        console.log("Error in getAllJobs:", error);
        return res.status(500).json({
            message: "Server error while fetching jobs",
            error: error.message,
            success: false
        });
    }
}
// Public endpoint for job details - works for both authenticated and non-authenticated users
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        // Populate company information for all users
        const job = await Job.findById(jobId).populate({
            path: "company"
        });

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // If user is authenticated, also populate applications
        if (req.id) {
            await job.populate({
                path: "applications"
            });
        }

        return res.status(200).json({ job, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Server error while fetching job details",
            success: false
        });
    }
}
// admin kitne job create kra hai abhi tk
export const getAdminJobs = async (req, res) => {
    try {
        console.log("GET /job/getadminjobs - User ID:", req.id);
        const adminId = req.id;

        if (!adminId) {
            console.log("Authentication error: No admin ID in request");
            return res.status(401).json({
                message: "Authentication failed. Please log in again.",
                success: false
            });
        }

        console.log("Fetching jobs for admin ID:", adminId);
        const jobs = await Job.find({ created_by: adminId }).populate({
            path: 'company'
        }).sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            console.log("No jobs found for this admin");
            // Return 200 with empty array instead of 404
            return res.status(200).json({
                message: "No jobs found for this admin.",
                jobs: [],
                success: true
            });
        }

        console.log(`Found ${jobs.length} jobs for admin`);
        return res.status(200).json({
            jobs,
            success: true
        });
    } catch (error) {
        console.log("Error in getAdminJobs:", error);
        return res.status(500).json({
            message: "Server error while fetching admin jobs",
            error: error.message,
            success: false
        });
    }
}
