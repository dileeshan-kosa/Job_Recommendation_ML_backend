const jobpostTable = require("../models/jobPost_model");

const router = require("../routes");
const sw = require("stopword");
const path = require("path");
const fs = require("fs");

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
  getjobpostdetails: async (req, res) => {
    try {
      const jobposttables = await jobpostTable.find();

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

          await jobpostTable.findByIdAndUpdate(job._id, {
            job_text_clean: noStopwords,
          });

          return {
            _id: job._id,
            jobroles: job.jobroles || "",
            company: job.company || "",
            category: job.category || "",
            location: job.location || "",
            jobdescription: job.jobdescription || "",
            job_text_clean: noStopwords,
          };
        })
      );

      // Step 2: Export to CSV
      const csvHeader =
        "id,jobroles,company,category,location,jobdescription,job_text_clean\n";

      const csvRows = formattedJobPosts.map((row) => {
        return `${row._id},"${row.jobroles}","${row.company}","${row.category}","${row.location}","${row.jobdescription}","${row.job_text_clean}"`;
      });

      const csvContent = csvHeader + csvRows.join("\n");

      const outputPath = path.join(
        __dirname,
        "../exports/job_listings_cleaned.csv"
      );
      fs.writeFileSync(outputPath, csvContent, "utf8");

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
