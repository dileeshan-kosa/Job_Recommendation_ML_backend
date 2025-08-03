const jobpostTable = require("../models/jobPost_model");

const router = require("../routes");
const sw = require("stopword");

// Utility function to clean text
function cleanText(text) {
  if (!text) return "";
  text = text.toLowerCase();
  text = text.replace(/http\S+/g, ""); // Remove URLs
  text = text.replace(/[^a-z\s]/g, ""); // Remove punctuation/numbers
  text = text.replace(/\s+/g, " "); // Collapse multiple spaces
  return text.trim();
}

// Remove stopwords
function removeStopwords(text) {
  const words = text.split(" ");
  const filtered = sw.removeStopwords(words); // uses English stopwords by default
  return filtered.join(" ");
}

const manageJobPost = {
  //add job post
  createJobpost: async (req, res) => {
    try {
      const { jobroles, company, category, location, jobdescription, skill } =
        req.body;

      const newJobPost = new jobpostTable({
        jobroles,
        company,
        category,
        location,
        jobdescription,
        // skill,
      });
      const saveJobPost = await newJobPost.save();
      res.status(201).json({
        message: "Job post created successfully.",
        data: saveJobPost,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        message: "Job Post Details not added.",
      });
    }
  },

  //   get job post data
  // getjobpostdetails: async (req, res) => {
  //   try {
  //     let jobposttables = await jobpostTable.find();

  //     // Format each job post into readable strings
  //     const formattedJobPosts = jobposttables.map((job) => {
  //       return [
  //         `jobrole: ${job.jobroles || ""}`,
  //         `company: ${job.company || ""}`,
  //         `category: ${job.category || ""}`,
  //         `location: ${job.location || ""}`,
  //         `jobdescription: ${job.jobdescription || ""}`,
  //       ];
  //     });

  //     // console.log("All jobpost data Fetched");
  //     // res.send(jobposttables);
  //     // console.log("Job Post Data", jobposttables);

  //     res.status(200).json({
  //       message: "Job posts retrieved successfully",
  //       jobPostsFormatted: formattedJobPosts,
  //       // jobPostsRaw: jobposttables, // include original raw data too (optional)
  //     });

  //   } catch (err) {
  //     console.log(err);
  //     res.status(400).json({
  //       message: err.message || err,
  //       error: true,
  //       success: false,
  //     });
  //   }
  // },
  getjobpostdetails: async (req, res) => {
    try {
      const jobposttables = await jobpostTable.find();

      // const formattedJobPosts = jobposttables.map((job) => {
      //   const combinedText = [
      //     job.jobroles,
      //     job.company,
      //     job.category,
      //     job.location,
      //     job.jobdescription,
      //   ]
      //     .filter(Boolean) // Remove null/undefined
      //     .join(" ");

      //   const cleaned = cleanText(combinedText);
      //   const noStopwords = removeStopwords(cleaned);

      //   return noStopwords;
      // });

      const formattedJobPosts = await Promise.all(
        jobposttables.map(async (job) => {
          const combinedText = [
            job.jobroles,
            job.company,
            job.category,
            job.location,
            job.jobdescription,
          ]
            .filter(Boolean)
            .join(" ");

          const cleaned = cleanText(combinedText);
          const noStopwords = removeStopwords(cleaned);

          // Update the current job post document with cleaned text
          await jobpostTable.findByIdAndUpdate(job._id, {
            job_text_clean: noStopwords,
          });

          return noStopwords;
        })
      );

      res.status(200).json({
        message: "Job posts retrieved successfully",
        jobPostsFormatted: formattedJobPosts,
      });
    } catch (err) {
      console.log(err);
      res.status(400).json({
        message: err.message || err,
        error: true,
        success: false,
      });
    }
  },
};
module.exports = manageJobPost;
