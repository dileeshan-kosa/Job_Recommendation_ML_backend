const mongoose = require("mongoose");

const userProfileSchema = new mongoose.Schema({
  name: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: String,

  fileName: { type: String, default: null },
  fileType: { type: String, default: null },
  filePath: { type: String, default: null },

  // Professional Profile Fields
  fullName: { type: String, default: null },
  dateOfBirth: { type: String, default: null },
  headline: { type: String, default: null },
  email_1: { type: String, default: null },
  website: { type: String, default: null },
  phone: { type: String, default: null },
  location: { type: String, default: null },
  profiles: { type: [String], default: null },
  experience: {
    type: [
      {
        company: String,
        position: String,
        dateRange: String,
        location: String,
        // default: null,
      },
    ],
    default: null,
  },

  education: {
    type: [
      {
        institution: String,
        typeOfStudy: String,
        areaOfStudy: String,
        score: String,
        dateRange: String,
      },
    ],
    default: null,
  },

  skills: {
    type: [
      {
        name: String,
        description: String,
        level: { type: String, enum: ["1", "2", "3", "4", "5"] },
      },
    ],
    default: null,
  },

  certifications: {
    type: [
      {
        name: String,
        issuer: String,
        date: String,
        website: String,
      },
    ],
    default: null,
  },

  interests: { type: [String], default: null },

  projects: {
    type: [
      {
        name: String,
        description: String,
        dateRange: String,
        website: String,
      },
    ],
    default: null,
  },

  volunteering: {
    type: [
      {
        organization: String,
        position: String,
        dateRange: String,
        location: String,
      },
    ],
    default: null,
  },
  references: {
    type: [
      {
        name: String,
        email: String,
        contactNumber: String,
      },
    ],
    default: null,
  },

  summary: { type: String, default: null },

  uploadDate: {
    type: Date,
    default: Date.now,
  },

  user_profiles_cleaned: { type: [String], default: [] },
});

const userprofileTable = mongoose.model("user_profile", userProfileSchema);

module.exports = userprofileTable;
