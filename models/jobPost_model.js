const mongoose = require("mongoose");

const jobpostSchema = new mongoose.Schema({
  jobroles: String,
  company: String,
  category: String,
  location: String,
  jobdescription: String,
  // skill: { type: [String], default: null },
  job_text_clean: { type: String, default: null },
});

const jobpostTable = mongoose.model("job_listing", jobpostSchema);

module.exports = jobpostTable;
