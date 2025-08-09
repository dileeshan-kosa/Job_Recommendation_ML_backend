import sys
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.metrics.pairwise import cosine_similarity

# === 0. Read User ID passed from Node.js ===
if len(sys.argv) < 2:
    raise ValueError("User ID not provided as argument.")

user_id = sys.argv[1]

# === 1. Load CSV files ===
job_df = pd.read_csv('./exports/job_listings_cleaned.csv')
user_df = pd.read_csv('./exports/user_profiles_cleaned.csv')

# === 2. Validate inputs ===
if 'job_text_clean' not in job_df.columns or 'category' not in job_df.columns:
    raise ValueError("job_listings_cleaned.csv must contain 'job_text_clean' and 'category' columns")

if 'user_text_clean' not in user_df.columns or 'id' not in user_df.columns:
    raise ValueError("user_profiles_cleaned.csv must contain 'user_text_clean' and 'id' columns")

# === 3. Load SBERT model ===
model = SentenceTransformer('all-MiniLM-L6-v2')

# === 4. Generate embeddings for job descriptions ===
job_embeddings = model.encode(job_df['job_text_clean'].tolist())

# === 5. Generate embeddings for user profiles ===
user_embeddings = model.encode(user_df['user_text_clean'].tolist())

# === 6. Assign job category to each user using cosine similarity ===
similarities = cosine_similarity(user_embeddings, job_embeddings)

user_labels = []
for user_idx in range(similarities.shape[0]):
    best_job_idx = np.argmax(similarities[user_idx])
    user_labels.append(job_df.iloc[best_job_idx]['category'])

user_df['job_category_label'] = user_labels

# === 7. Encode job categories ===
label_encoder = LabelEncoder()
user_df['label_encoded'] = label_encoder.fit_transform(user_df['job_category_label'])

# === 8. UPDATED: Handle small datasets safely ===
if len(user_df) < 2:
    # Not enough samples to split — train on all
    X_train, y_train = user_embeddings, user_df['label_encoded']
    X_test, y_test = user_embeddings, user_df['label_encoded']
else:
    X_train, X_test, y_train, y_test = train_test_split(
        user_embeddings, user_df['label_encoded'], test_size=0.2, random_state=42
    )

# === 9. Train the XGBoost model ===
num_classes = len(label_encoder.classes_)
xgb_model = XGBClassifier(
    objective='multi:softmax',
    num_class=num_classes,
    eval_metric='mlogloss',
    use_label_encoder=False
)
xgb_model.fit(X_train, y_train)

# === 10. Evaluate the model on test set ===
y_pred = xgb_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy on Test Set: {accuracy * 100:.2f}%")
# print("Classification Report:")
# print(classification_report(y_test, y_pred, target_names=label_encoder.classes_))

# === 11. Locate index of the logged-in user ===
try:
    user_index = user_df[user_df['id'] == user_id].index[0]
except IndexError:
    raise ValueError(f"User ID '{user_id}' not found in user_profiles_cleaned.csv")

# === 12. Predict category for the given user ===
user_prediction = xgb_model.predict(user_embeddings[user_index].reshape(1, -1))
predicted_category = label_encoder.inverse_transform(user_prediction)[0]

# === 13. Recommend Top 5 Jobs Closest to This User ===
similarities = cosine_similarity(user_embeddings[user_index].reshape(1, -1), job_embeddings)[0]
top_indices = similarities.argsort()[-5:][::-1]
top_jobs = job_df.iloc[top_indices]

# === 14. Output results ===
print("Predicted Job Category:", predicted_category)
print("\nTop 5 Recommended Jobs:")
for i, row in top_jobs.iterrows():
    print(f"- {row['jobroles']} at {row['company']} ({row['category']})")
