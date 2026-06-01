import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
from pathlib import Path

# Import data loading and feature engineering from existing pipeline
from train_models import load_and_prepare_data, build_feature_row

app = FastAPI(title="College Predictor ML API")

# Enable CORS for Next.js app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
MODEL_DIR = Path(__file__).parent / "ml_models"
models = {}
encoders = {}
long_df = None
feature_cols = []

class PredictRequest(BaseModel):
    rank: int
    category: str
    gender: str
    branch: str = "ALL"
    district: str = "ALL"
    budget: int = 0
    collegeType: str = "All"
    region: str = "ALL"

@app.on_event("startup")
async def startup_event():
    global models, encoders, long_df, feature_cols
    print("Loading models and data...")
    
    # Check if models exist
    if not (MODEL_DIR / "xgb_admission_classifier.pkl").exists():
        print("Models not found. Please run train_models.py first.")
        return
        
    # Load models
    models["xgb_clf"] = joblib.load(MODEL_DIR / "xgb_admission_classifier.pkl")
    models["lgbm_clf"] = joblib.load(MODEL_DIR / "lgbm_chance_classifier.pkl")
    feature_cols = joblib.load(MODEL_DIR / "feature_cols.pkl")
    
    # Load data
    long_df_loaded, enc = load_and_prepare_data()
    long_df = long_df_loaded
    encoders = enc
    print("Startup complete. API ready.")

@app.get("/")
async def root():
    return {"status": "ok", "message": "API is running"}

@app.post("/predict")
async def predict(request: PredictRequest):
    if long_df is None:
        raise HTTPException(status_code=503, detail="Models and data not loaded.")
        
    # Filter colleges based on input
    mask = (long_df["category"] == request.category) & (long_df["gender"] == request.gender)
    
    if request.branch != "ALL":
        mask = mask & (long_df["branch_code"] == request.branch)
        
    if request.district != "ALL":
        mask = mask & (long_df["district_code"] == request.district)
        
    if request.collegeType != "All":
        mask = mask & (long_df["type_code"] == request.collegeType)
        
    if request.budget > 0:
        mask = mask & (long_df["fee"] <= request.budget)
        
    filtered_df = long_df[mask].drop_duplicates(subset=["inst_code", "branch_code"])
    
    if len(filtered_df) == 0:
        return []
        
    results = []
    
    # Batch predict
    features_list = []
    meta_list = []
    
    for _, col_row in filtered_df.iterrows():
        feat = build_feature_row(col_row, request.rank, admitted=0)
        features_list.append([feat[c] for c in feature_cols])
        
        meta_list.append({
            "inst_code": col_row["inst_code"],
            "branch_code": col_row["branch_code"],
            "closing_rank": col_row["closing_rank"],
            "rankGap": col_row["closing_rank"] - request.rank,
        })
        
    feat_vecs = np.array(features_list)
    
    # Get predictions
    probs = models["xgb_clf"].predict_proba(feat_vecs)[:, 1]
    chances = models["lgbm_clf"].predict(feat_vecs)
    
    chance_labels = ["low", "medium", "high"]
    
    for i, meta in enumerate(meta_list):
        prob = int(probs[i] * 100)
        chance = chance_labels[chances[i]]
        
        results.append({
            "inst_code": meta["inst_code"],
            "branch_code": meta["branch_code"],
            "closing_rank": int(meta["closing_rank"]),
            "rankGap": int(meta["rankGap"]),
            "probability": prob,
            "chanceLevel": chance
        })
        
    return results

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("serve_models:app", host="0.0.0.0", port=8000, reload=True)
