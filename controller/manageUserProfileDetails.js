const userprofileTable = require("../models/userCvDetailsModel");
const fs = require("fs");
const pdfParse = require("pdf-parse");
const sw = require("stopword"); //

const router = require("../routes");

const manageUserProfileDetails = {
  // add cv
  createCvData: async (req, res) => {
    try {
      const file = req.file;
      const {
        fullName,
        dateOfBirth,
        headline,
        email,
        website,
        phone,
        location,
        profiles,
        experience,
        education,
        skills,
        languages,
        certifications,
        interests,
        projects,
        volunteering,
        references,
        summary,
      } = req.body;

      const userData = {
        fileName: file ? file.originalname : null,
        fileType: file ? file.mimetype : null,
        filePath: file ? file.path : null,

        fullName: fullName || null,
        dateOfBirth: dateOfBirth || null,
        headline: headline || null,
        email: email || null,
        website: website || null,
        phone: phone || null,
        headline: headline || null,
        profiles: profiles || null,
        experience: experience || null,
        education: education || null,
        skills: skills || null,
        languages: languages || null,
        certifications: certifications || null,
        interests: interests || null,
        projects: projects || null,
        volunteering: volunteering || null,
        references: references || null,
        summary: summary || null,
      };

      const newUserProfileDetails = new userprofileTable(userData);
      const saveUserProfileDetails = await newUserProfileDetails.save();

      res.status(201).json({
        message: "CV Add Successfully",
        data: saveUserProfileDetails,
      });
    } catch (error) {
      console.log("error", error);
      return res.status(500).json({
        message: "CV not added.",
      });
    }
  },

  // New: Read CV Data
  getUserProfileDetails: async (req, res) => {
    try {
      const { id } = req.params;
      const profile = await userprofileTable.findById(id);

      if (!profile) {
        return res.status(404).json({ message: "User profile not found." });
      }

      let extractedText = null;
      let profileDetailsText = null;

      // If CV file path exists, read and parse the PDF
      if (profile.filePath) {
        try {
          const pdfBuffer = fs.readFileSync(profile.filePath);
          const data = await pdfParse(pdfBuffer);
          extractedText = data.text;
        } catch (pdfErr) {
          console.warn("Failed to parse PDF:", pdfErr);
        }
      }

      if (
        profile.fullName ||
        profile.dateOfBirth ||
        profile.headline ||
        profile.email ||
        profile.website ||
        profile.phone ||
        profile.location ||
        profile.profiles ||
        profile.experience ||
        profile.education ||
        profile.skills ||
        // profile.skills ||
        profile.certifications ||
        profile.interests ||
        profile.projects ||
        profile.volunteering ||
        profile.references ||
        profile.summary
      ) {
        profileDetailsText = [
          `name: ${profile.fullName || ""}`,
          `headline: ${profile.headline || ""}`,
          `email: ${profile.email || ""}`,
          `location: ${profile.location || ""}`,
          `profiles: ${
            Array.isArray(profile.profiles) ? profile.profiles.join(" | ") : ""
          }`,
          `experience: ${
            Array.isArray(profile.experience)
              ? profile.experience
                  .map(
                    (exp) =>
                      `${exp.position || ""} at ${exp.company || ""} (${
                        exp.dateRange || ""
                      })`
                  )
                  .join(" | ")
              : ""
          }`,
          `education: ${
            Array.isArray(profile.education)
              ? profile.education
                  .map(
                    (edu) =>
                      `${edu.typeOfStudy || ""} ${edu.areaOfStudy || ""} at ${
                        edu.institution || ""
                      }`
                  )
                  .join(" | ")
              : ""
          }`,
          `skills: ${
            Array.isArray(profile.skills)
              ? profile.skills
                  .map((s) => s.name || s.description || "")
                  .join(" | ")
              : ""
          }`,
          `certifications: ${
            Array.isArray(profile.certifications)
              ? profile.certifications.map((c) => c.name || "").join(" | ")
              : ""
          }`,
          `interests: ${
            Array.isArray(profile.interests)
              ? profile.interests.join(" | ")
              : ""
          }`,
          `projects: ${
            Array.isArray(profile.projects)
              ? profile.projects.map((p) => p.name || "").join(" | ")
              : ""
          }`,
          `volunteering: ${
            Array.isArray(profile.volunteering)
              ? profile.volunteering
                  .map((v) => `${v.position || ""} at ${v.organization || ""}`)
                  .join(" | ")
              : ""
          }`,
          `references: ${
            Array.isArray(profile.references)
              ? profile.references.map((r) => r.name || "").join(" | ")
              : ""
          }`,
          `summary: ${profile.summary || ""}`,
        ].filter(Boolean); // remove nulls
        // .join("\n");
      } else if (extractedText) {
        // If DB profile data is missing, fallback to extracted text
        // profileDetailsText = extractedText.trim();
      }

      // 1. Build raw profile details array
      const profileDetailsArray = [
        profile.fullName,
        profile.headline,
        profile.email,
        profile.location,
        Array.isArray(profile.profiles) ? profile.profiles.join(" ") : "",
        Array.isArray(profile.experience)
          ? profile.experience
              .map((exp) => `${exp.position} at ${exp.company}`)
              .join(" ")
          : "",
        Array.isArray(profile.education)
          ? profile.education
              .map(
                (edu) =>
                  `${edu.typeOfStudy} ${edu.areaOfStudy} at ${edu.institution}`
              )
              .join(" ")
          : "",
        Array.isArray(profile.skills)
          ? profile.skills
              .map((s) => `${s.name} ${s.description || ""}`)
              .join(" ")
          : "",
        Array.isArray(profile.certifications)
          ? profile.certifications.map((c) => c.name).join(" ")
          : "",
        Array.isArray(profile.interests) ? profile.interests.join(" ") : "",
        Array.isArray(profile.projects)
          ? profile.projects.map((p) => p.name).join(" ")
          : "",
        Array.isArray(profile.volunteering)
          ? profile.volunteering
              .map((v) => `${v.position} at ${v.organization}`)
              .join(" ")
          : "",
        Array.isArray(profile.references)
          ? profile.references.map((r) => r.name).join(" ")
          : "",
        profile.summary,
      ].filter(Boolean);

      // 2. Clean text function
      function cleanText(text) {
        if (!text) return "";
        text = text.toLowerCase();
        text = text.replace(/http\S+/g, ""); // Remove URLs
        text = text.replace(/[^a-z\s]/g, ""); // Remove punctuation/numbers
        text = text.replace(/\s+/g, " "); // Collapse multiple spaces
        return text.trim();
      }

      // remove stopwords
      function removeStopwords(text) {
        const words = text.split(" ");
        const filtered = sw.removeStopwords(words); 
        return filtered.join(" ");
      }

      // Check if structured profile data has any meaningful content
      const hasProfileData = profileDetailsArray.some(
        (item) => item && item.trim().length > 0
      );

      let user_profiles_cleaned;

      if (hasProfileData) {
        // Clean and remove stopwords from structured profile data
        const cleanedText = cleanText(profileDetailsArray.join(" "));
        user_profiles_cleaned = [removeStopwords(cleanedText)];
      } else if (extractedText && extractedText.trim().length > 0) {
        // Fallback: Clean and remove stopwords from extracted PDF text
        const cleanedText = cleanText(extractedText);
        user_profiles_cleaned = [removeStopwords(cleanedText)];
      } else {
        user_profiles_cleaned = [];
      }

      // 3. Create cleaned output as single array item
      // const cleanedText = cleanText(profileDetailsArray.join(" "));
      // const user_profiles_cleaned = [removeStopwords(cleanedText)];

      // Save to DB
      profile.user_profiles_cleaned = user_profiles_cleaned;
      await profile.save();

      res.status(200).json({
        message: "User profile retrieved successfully",
        profileDetails: profileDetailsText,
        user_profiles_cleaned,
        // cvText: extractedText,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Error retrieving user profile" });
    }
  },
};

module.exports = manageUserProfileDetails;
