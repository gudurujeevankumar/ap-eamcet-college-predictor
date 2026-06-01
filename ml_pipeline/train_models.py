"""
AP EAPCET College Predictor — Machine Learning Training Pipeline
================================================================
Trains real ML models on the cutoff data:
  1. XGBoost Classifier — Predicts admission probability (admitted/not)
  2. LightGBM Classifier — Chance classification (High/Medium/Low)
  3. XGBoost Regressor — Predicts closing rank for forecasting

Features engineered from raw data, models saved with joblib.
"""

import pandas as pd
import numpy as np
import json
import os
import joblib
from pathlib import Path

# ─────────────────────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────────────────────

BASE_DIR = Path(__file__).parent
CSV_PATH = BASE_DIR / "cutoff_data_raw.csv"
MODEL_DIR = BASE_DIR / "ml_models"
MODEL_DIR.mkdir(exist_ok=True)

CATEGORY_COLS = {
    "OC_Male": ("OC_BOYS",),
    "OC_Female": ("OC_GIRLS",),
    "SC_Male": ("SC_BOYS",),
    "SC_Female": ("SC_GIRLS",),
    "ST_Male": ("ST_BOYS",),
    "ST_Female": ("ST_GIRLS",),
    "BC-A_Male": ("BCA_BOYS",),
    "BC-A_Female": ("BCA_GIRLS",),
    "BC-B_Male": ("BCB_BOYS",),
    "BC-B_Female": ("BCB_GIRLS",),
    "BC-C_Male": ("BCC_BOYS",),
    "BC-C_Female": ("BCC_GIRLS",),
    "BC-D_Male": ("BCD_BOYS",),
    "BC-D_Female": ("BCD_GIRLS",),
    "BC-E_Male": ("BCE_BOYS",),
    "BC-E_Female": ("BCE_GIRLS",),
    "EWS_Male": ("EWS_BOYS",),
    "EWS_Female": ("EWS_GIRLS",),
}

TOTAL_STUDENTS = 180000


def load_and_prepare_data():
    """Load CSV and melt into long-form training data."""
    print("📂 Loading raw data...")
    df = pd.read_csv(CSV_PATH)
    
    # Clean column names
    df.columns = df.columns.str.strip()
    
    print(f"   Raw shape: {df.shape}")
    
    # Encode categorical features
    # College encoding
    college_codes = df["INSTCODE"].unique()
    college_to_id = {c: i for i, c in enumerate(college_codes)}
    
    # Branch encoding
    branch_codes = df["BRANCH_CODE"].unique()
    branch_to_id = {b: i for i, b in enumerate(branch_codes)}
    
    # District encoding
    district_codes = df["DIST"].unique()
    district_to_id = {d: i for i, d in enumerate(district_codes)}
    
    # Type encoding
    type_codes = df["TYPE"].unique()
    type_to_id = {t: i for i, t in enumerate(type_codes)}
    
    # Save encoders
    encoders = {
        "college_to_id": college_to_id,
        "branch_to_id": branch_to_id,
        "district_to_id": district_to_id,
        "type_to_id": type_to_id,
        "id_to_college": {v: k for k, v in college_to_id.items()},
        "id_to_branch": {v: k for k, v in branch_to_id.items()},
        "id_to_district": {v: k for k, v in district_to_id.items()},
        "id_to_type": {v: k for k, v in type_to_id.items()},
    }
    
    # Melt: convert wide category columns to long form
    # Each row becomes: college, branch, category, gender, closing_rank
    rows = []
    
    for _, row in df.iterrows():
        base = {
            "college_id": college_to_id[row["INSTCODE"]],
            "college_name": row["NAME"],
            "inst_code": row["INSTCODE"],
            "branch_id": branch_to_id[row["BRANCH_CODE"]],
            "branch_code": row["BRANCH_CODE"],
            "district_id": district_to_id[row["DIST"]],
            "district_code": row["DIST"],
            "type_id": type_to_id[row["TYPE"]],
            "type_code": row["TYPE"],
            "fee": pd.to_numeric(row.get("COLLEGE_FEE", 0), errors="coerce") or 0,
            "established": pd.to_numeric(row.get("ESTD", 2000), errors="coerce") or 2000,
        }
        
        for cat_gender, (col,) in CATEGORY_COLS.items():
            cat, gender = cat_gender.rsplit("_", 1)
            val = pd.to_numeric(row.get(col, None), errors="coerce")
            if pd.notna(val) and val > 0:
                r = base.copy()
                r["category"] = cat
                r["gender"] = gender
                r["category_id"] = list(CATEGORY_COLS.keys()).index(cat_gender)
                r["closing_rank"] = int(val)
                rows.append(r)
    
    long_df = pd.DataFrame(rows)
    print(f"   Long-form dataset: {len(long_df)} rows")
    
    return long_df, encoders


def engineer_features(long_df):
    """
    Create training dataset by generating synthetic student-college matches.
    For each college-branch-category-gender combo:
      - Generate students with various ranks
      - Label: admitted=1 if rank <= closing_rank, else admitted=0
    """
    print("\n🔧 Engineering features...")
    
    train_rows = []
    
    for _, row in long_df.iterrows():
        closing_rank = row["closing_rank"]
        
        # Generate positive samples (admitted: rank < closing_rank)
        # Sample ranks at different gaps
        positive_ranks = []
        
        # Very comfortable (large gap)
        for gap_pct in [0.5, 0.6, 0.7, 0.8]:
            r = int(closing_rank * gap_pct)
            if r >= 1:
                positive_ranks.append(r)
        
        # Comfortable
        for gap_pct in [0.85, 0.9, 0.93]:
            r = int(closing_rank * gap_pct)
            if r >= 1:
                positive_ranks.append(r)
        
        # Close to cutoff (barely admitted)
        for gap_pct in [0.95, 0.97, 0.99, 1.0]:
            r = int(closing_rank * gap_pct)
            if r >= 1:
                positive_ranks.append(r)
        
        # Generate negative samples (not admitted: rank > closing_rank)
        negative_ranks = []
        
        # Just above cutoff
        for gap_pct in [1.02, 1.05, 1.08]:
            negative_ranks.append(int(closing_rank * gap_pct))
        
        # Significantly above
        for gap_pct in [1.15, 1.3, 1.5, 2.0]:
            r = int(closing_rank * gap_pct)
            if r <= TOTAL_STUDENTS:
                negative_ranks.append(r)
        
        for student_rank in positive_ranks:
            train_rows.append(build_feature_row(row, student_rank, admitted=1))
        
        for student_rank in negative_ranks:
            train_rows.append(build_feature_row(row, student_rank, admitted=0))
    
    train_df = pd.DataFrame(train_rows)
    print(f"   Training samples: {len(train_df)} ({train_df['admitted'].sum()} positive, {(1-train_df['admitted']).sum()} negative)")
    
    return train_df


def build_feature_row(college_row, student_rank, admitted):
    """Build a feature vector for a student-college match."""
    closing_rank = college_row["closing_rank"]
    rank_gap = closing_rank - student_rank
    
    return {
        # Student features
        "student_rank": student_rank,
        "rank_normalized": student_rank / TOTAL_STUDENTS,
        
        # College features
        "college_id": college_row["college_id"],
        "branch_id": college_row["branch_id"],
        "district_id": college_row["district_id"],
        "type_id": college_row["type_id"],
        "category_id": college_row["category_id"],
        "fee": college_row["fee"],
        "fee_normalized": college_row["fee"] / 250000 if college_row["fee"] > 0 else 0.5,
        "established": college_row["established"],
        "college_age": 2024 - college_row["established"],
        
        # Derived features
        "closing_rank": closing_rank,
        "rank_gap": rank_gap,
        "rank_gap_ratio": rank_gap / max(closing_rank, 1),
        "rank_gap_abs_ratio": abs(rank_gap) / max(closing_rank, 1),
        "is_rank_below_cutoff": 1 if student_rank <= closing_rank else 0,
        "rank_percentile": 1 - (student_rank / TOTAL_STUDENTS),
        "cutoff_percentile": 1 - (closing_rank / TOTAL_STUDENTS),
        "rank_to_cutoff_ratio": student_rank / max(closing_rank, 1),
        
        # Target
        "admitted": admitted,
    }


def train_models(train_df, encoders):
    """Train XGBoost and LightGBM models."""
    from sklearn.model_selection import cross_val_score, StratifiedKFold
    from sklearn.metrics import classification_report, accuracy_score, roc_auc_score
    from xgboost import XGBClassifier, XGBRegressor
    from lightgbm import LGBMClassifier
    
    # ─── FEATURE COLUMNS ───
    feature_cols = [
        "student_rank", "rank_normalized",
        "college_id", "branch_id", "district_id", "type_id", "category_id",
        "fee", "fee_normalized", "established", "college_age",
        "closing_rank", "rank_gap", "rank_gap_ratio", "rank_gap_abs_ratio",
        "is_rank_below_cutoff", "rank_percentile", "cutoff_percentile",
        "rank_to_cutoff_ratio",
    ]
    
    X = train_df[feature_cols].values
    y_admitted = train_df["admitted"].values
    
    # Chance levels: High (rank << cutoff), Medium (rank ~ cutoff), Low (rank > cutoff)
    def classify_chance(row):
        ratio = row["rank_to_cutoff_ratio"]
        if ratio <= 0.85:
            return 2  # High
        elif ratio <= 1.0:
            return 1  # Medium
        else:
            return 0  # Low
    
    y_chance = train_df.apply(classify_chance, axis=1).values
    
    # ─── MODEL 1: XGBoost Admission Classifier ───
    print("\n🤖 Training Model 1: XGBoost Admission Classifier...")
    xgb_clf = XGBClassifier(
        n_estimators=200,
        max_depth=8,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=5,
        gamma=0.1,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        eval_metric="logloss",
        use_label_encoder=False,
    )
    
    # Cross-validation
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(xgb_clf, X, y_admitted, cv=cv, scoring="roc_auc")
    print(f"   CV ROC-AUC: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
    
    # Train on full data
    xgb_clf.fit(X, y_admitted)
    
    y_pred = xgb_clf.predict(X)
    y_prob = xgb_clf.predict_proba(X)[:, 1]
    print(f"   Training Accuracy: {accuracy_score(y_admitted, y_pred):.4f}")
    print(f"   Training ROC-AUC: {roc_auc_score(y_admitted, y_prob):.4f}")
    
    # Feature importance
    importances = dict(zip(feature_cols, xgb_clf.feature_importances_))
    sorted_imp = sorted(importances.items(), key=lambda x: x[1], reverse=True)
    print("   Top 5 features:")
    for feat, imp in sorted_imp[:5]:
        print(f"     {feat}: {imp:.4f}")
    
    # ─── MODEL 2: LightGBM Chance Classifier ───
    print("\n🤖 Training Model 2: LightGBM Chance Classifier (High/Medium/Low)...")
    lgbm_clf = LGBMClassifier(
        n_estimators=200,
        max_depth=8,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        min_child_weight=5,
        reg_alpha=0.1,
        reg_lambda=1.0,
        random_state=42,
        verbose=-1,
        num_class=3,
    )
    
    cv_scores_lgbm = cross_val_score(lgbm_clf, X, y_chance, cv=cv, scoring="accuracy")
    print(f"   CV Accuracy: {cv_scores_lgbm.mean():.4f} (+/- {cv_scores_lgbm.std():.4f})")
    
    lgbm_clf.fit(X, y_chance)
    y_chance_pred = lgbm_clf.predict(X)
    print(f"   Training Accuracy: {accuracy_score(y_chance, y_chance_pred):.4f}")
    print(f"   Classification Report:")
    print(classification_report(y_chance, y_chance_pred, target_names=["Low", "Medium", "High"]))
    
    # ─── MODEL 3: XGBoost Regressor (Closing Rank Predictor) ───
    print("🤖 Training Model 3: XGBoost Regressor (Closing Rank Predictor)...")
    
    # For regression, use college features to predict closing rank
    reg_feature_cols = [
        "college_id", "branch_id", "district_id", "type_id", "category_id",
        "fee", "fee_normalized", "established", "college_age",
    ]
    X_reg = train_df[reg_feature_cols].values
    y_reg = train_df["closing_rank"].values
    
    xgb_reg = XGBRegressor(
        n_estimators=200,
        max_depth=8,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
    )
    
    from sklearn.metrics import mean_absolute_error, r2_score
    cv_scores_reg = cross_val_score(xgb_reg, X_reg, y_reg, cv=5, scoring="r2")
    print(f"   CV R² Score: {cv_scores_reg.mean():.4f} (+/- {cv_scores_reg.std():.4f})")
    
    xgb_reg.fit(X_reg, y_reg)
    y_reg_pred = xgb_reg.predict(X_reg)
    print(f"   Training R²: {r2_score(y_reg, y_reg_pred):.4f}")
    print(f"   Training MAE: {mean_absolute_error(y_reg, y_reg_pred):.0f} ranks")
    
    # ─── SAVE MODELS ───
    print("\n💾 Saving models...")
    joblib.dump(xgb_clf, MODEL_DIR / "xgb_admission_classifier.pkl")
    joblib.dump(lgbm_clf, MODEL_DIR / "lgbm_chance_classifier.pkl")
    joblib.dump(xgb_reg, MODEL_DIR / "xgb_rank_regressor.pkl")
    joblib.dump(feature_cols, MODEL_DIR / "feature_cols.pkl")
    joblib.dump(reg_feature_cols, MODEL_DIR / "reg_feature_cols.pkl")
    
    # Save encoders as JSON
    serializable_encoders = {}
    for key, val in encoders.items():
        serializable_encoders[key] = {str(k): v for k, v in val.items()}
    
    with open(MODEL_DIR / "encoders.json", "w") as f:
        json.dump(serializable_encoders, f)
    
    # Save metadata
    metadata = {
        "total_training_samples": len(train_df),
        "total_colleges": len(encoders["college_to_id"]),
        "total_branches": len(encoders["branch_to_id"]),
        "total_districts": len(encoders["district_to_id"]),
        "xgb_cv_roc_auc": float(cv_scores.mean()),
        "lgbm_cv_accuracy": float(cv_scores_lgbm.mean()),
        "xgb_reg_cv_r2": float(cv_scores_reg.mean()),
        "feature_cols": feature_cols,
        "reg_feature_cols": reg_feature_cols,
    }
    with open(MODEL_DIR / "metadata.json", "w") as f:
        json.dump(metadata, f, indent=2)
    
    print(f"   Models saved to: {MODEL_DIR}")
    
    return xgb_clf, lgbm_clf, xgb_reg


def main():
    print("=" * 60)
    print("  AP EAPCET ML Training Pipeline")
    print("=" * 60)
    
    # Step 1: Load data
    long_df, encoders = load_and_prepare_data()
    
    # Step 2: Engineer features
    train_df = engineer_features(long_df)
    
    # Step 3: Train models
    xgb_clf, lgbm_clf, xgb_reg = train_models(train_df, encoders)
    
    # Step 4: Quick test
    print("\n" + "=" * 60)
    print("  🧪 Quick Test — Rank: 45678, BC-D, Male, CSE")
    print("=" * 60)
    
    # Find CSE colleges
    test_mask = (long_df["branch_code"] == "CSE") & \
                (long_df["category"] == "BC-D") & \
                (long_df["gender"] == "Male")
    test_colleges = long_df[test_mask].drop_duplicates(subset=["inst_code"])
    
    feature_cols = joblib.load(MODEL_DIR / "feature_cols.pkl")
    student_rank = 45678
    
    results = []
    for _, col_row in test_colleges.iterrows():
        feat = build_feature_row(col_row, student_rank, admitted=0)
        feat_vec = np.array([[feat[c] for c in feature_cols]])
        
        prob = xgb_clf.predict_proba(feat_vec)[0][1]
        chance_pred = lgbm_clf.predict(feat_vec)[0]
        chance_label = ["Low", "Medium", "High"][chance_pred]
        
        results.append({
            "college": col_row["college_name"],
            "code": col_row["inst_code"],
            "cutoff": col_row["closing_rank"],
            "prob": prob,
            "chance": chance_label,
        })
    
    results.sort(key=lambda x: x["prob"], reverse=True)
    
    print(f"\n  Found {len(results)} CSE colleges for BC-D Male")
    print(f"\n  {'College':<50} {'Cutoff':>8} {'ML Prob':>8} {'Chance':>8}")
    print("  " + "─" * 80)
    
    for r in results[:10]:
        name = r["college"][:48]
        print(f"  {name:<50} {r['cutoff']:>8,} {r['prob']:>7.1%} {r['chance']:>8}")
    
    print(f"\n  ... and {max(0, len(results)-10)} more")
    print("\n✅ Training complete! Models ready for serving.\n")


if __name__ == "__main__":
    main()
