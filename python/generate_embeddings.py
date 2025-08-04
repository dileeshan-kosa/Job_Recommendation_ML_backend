from sentence_transformers import SentenceTransformer
import pandas as pd
import numpy as np

# === 1. Load Cleaned CSVs ===
user_df = pd.read_csv("exports/user_profiles_cleaned.csv")
job_df = pd.read_csv("exports/job_listings_cleaned.csv")

# === 2. Load Model ===
model = SentenceTransformer('all-MiniLM-L6-v2')

# === 3. Generate Embeddings ===
print("Generating embeddings...")

# === 4. Generate Embeddings ===
user_embeddings = model.encode(user_df["user_text_clean"].tolist(), show_progress_bar=True)
job_embeddings = model.encode(job_df["job_text_clean"].tolist(), show_progress_bar=True)

# === 4. Save Embeddings ===
np.save("exports/user_embeddings.npy", user_embeddings)
np.save("exports/job_embeddings.npy", job_embeddings)

# === 5. Print Summary ===
print("User Embeddings Shape:", user_embeddings.shape)
print("Job Embeddings Shape:", job_embeddings.shape)
print("SBERT Embedding Generation Completed.")