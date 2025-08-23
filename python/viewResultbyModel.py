# # === 11. Locate index of the logged-in user ===
# try:
#     user_index = user_df[user_df['id'] == user_id].index[0]
# except IndexError:
#     raise ValueError(f"User ID '{user_id}' not found in user_profiles_cleaned.csv")

# # === 12. Predict category for the given user ===
# user_prediction = xgb_model.predict(user_embeddings[user_index].reshape(1, -1))
# predicted_category = label_encoder.inverse_transform(user_prediction)[0]

# # === 13. Recommend Top 5 Jobs Closest to This User ===
# similarities = cosine_similarity(user_embeddings[user_index].reshape(1, -1), job_embeddings)[0]
# top_indices = similarities.argsort()[-5:][::-1]
# top_jobs = job_df.iloc[top_indices]

# # === 14. Output results ===
# print("Predicted Job Category:", predicted_category)
# print("\nTop 5 Recommended Jobs:")
# for i, row in top_jobs.iterrows():
#     print(f"- {row['jobroles']} at {row['company']} ({row['category']})")


from xgboost import XGBClassifier
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import pandas as pd
import sys
import json

# === 0. Read User ID passed from Node.js ===
if len(sys.argv) < 2:
    raise ValueError("User ID not provided as argument.")

user_id = sys.argv[1]

# === 1. Load model and encoder ===
model = XGBClassifier()
model.load_model('./models/xgb_model.json')

with open('./models/label_encoder.pkl', 'rb') as f:
    label_encoder = pickle.load(f)

# === 2. Load cleaned CSVs ===
job_df = pd.read_csv('./exports/job_listings_cleaned.csv')
user_df = pd.read_csv('./exports/user_profiles_cleaned.csv')

# === 3. Generate SBERT embeddings ===
sbert_model = SentenceTransformer("all-MiniLM-L6-v2")

job_embeddings = sbert_model.encode(job_df['job_text_clean'].tolist())
user_embeddings = sbert_model.encode(user_df['user_text_clean'].tolist())

# === 4. Find matching user ===
try:
    user_index = user_df[user_df['id'].astype(str) == str(user_id)].index[0]
except IndexError:
    raise ValueError(f"User ID '{user_id}' not found in user_profiles_cleaned.csv")

# === 5. Predict category ===
user_embedding = user_embeddings[user_index].reshape(1, -1)
user_prediction = model.predict(user_embedding)
predicted_category = label_encoder.inverse_transform(user_prediction)[0]

# === 6. Recommend Top 5 Jobs ===
similarities = cosine_similarity(user_embedding, job_embeddings)[0]
top_indices = similarities.argsort()[-5:][::-1]
top_jobs = job_df.iloc[top_indices].copy()
top_jobs['similarity_score'] = similarities[top_indices]

# # === 7. Output Results ===
# print(f"Predicted Job Category: {predicted_category}")
# print("\nTop 5 Recommended Jobs:")
# for _, row in top_jobs.iterrows():
#     print(f"- {row['jobroles']} at {row['company']} ({row['category']}) || Similarity Score: {row['similarity_score']:.4f}")

# === 7. Prepare JSON Output ===
results = {
    "predicted_category": predicted_category,
    "recommended_jobs": [
        {
            "jobrole": row['jobroles'],
            "company": row['company'],
            "category": row['category'],
            "similarity_score": float(row['similarity_score'])
        }
        for _, row in top_jobs.iterrows()
    ]
}

print(json.dumps(results)) 