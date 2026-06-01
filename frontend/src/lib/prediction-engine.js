// ============================================================
// AP EAPCET College Predictor — Prediction Engine
// Layer 1: Rule Engine + Layer 2: Scoring Engine
// ============================================================

import {
  getCutoffKey,
  REGION_GROUPS,
  BRANCH_NAMES,
  DISTRICT_NAMES,
} from "./types";

import cutoffData from "../data/cutoff-data.json";
import branchesData from "../data/branches.json";

const allRecords = cutoffData;
const TOTAL_STUDENTS = 180000; // Approximate AP EAPCET total participants

// ─────────────────────────────────────────────────────────────
// LAYER 1: RULE ENGINE — Strict Filtering
// ─────────────────────────────────────────────────────────────

function applyRuleEngine(records, input) {
  const cutoffKey = getCutoffKey(input.category, input.gender);
  return records.filter((record) => {
    // Branch match
    if (input.branch !== "ALL" && record.branchCode !== input.branch)
      return false;
    // College type match
    if (input.collegeType !== "All") {
      if (record.type !== input.collegeType) return false;
    }
    // District match
    if (input.district !== "ALL" && record.district !== input.district)
      return false;
    // Budget match (0 = no limit)
    if (input.budget > 0 && record.fee > input.budget) return false;
    // Must have cutoff data for this category+gender
    const cutoff = record.cutoffs[cutoffKey];
    if (cutoff === null || cutoff === undefined) return false;
    return true;
  });
}

// ─────────────────────────────────────────────────────────────
// LAYER 2: SCORING ENGINE — Weighted Algorithm
// ─────────────────────────────────────────────────────────────

function calculateRankSimilarity(userRank, closingRank) {
  const gap = closingRank - userRank;
  
  // If rank is better than closing rank (positive gap)
  if (gap >= 0) {
    if (gap > 20000) return 0.95; // Extremely safe
    if (gap > 10000) return 0.85; // Very safe
    return 0.80; // Safe (Best Fit upper half)
  }
  
  // If rank is worse than closing rank (negative gap)
  const absGap = Math.abs(gap);
  if (absGap <= 10000) return 0.65; // Reachable (Best Fit lower half)
  if (absGap <= 30000) return 0.45; // Unlikely (Medium chance)
  return 0.15; // Highly unlikely (Low chance)
}

function calculateFeeMatch(fee, budget) {
  if (budget <= 0) return 0.7; // No budget specified = neutral
  if (fee <= budget * 0.5) return 1.0; // Way under budget
  if (fee <= budget * 0.8) return 0.9; // Comfortable
  if (fee <= budget) return 0.7; // Tight but OK
  return 0.3; // Over budget (shouldn't happen after filter)
}

function calculateLocationMatch(
  collegeDistrict,
  preferredDistrict,
  collegeRegion,
) {
  if (preferredDistrict === "ALL") return 0.7; // No preference = neutral
  if (collegeDistrict === preferredDistrict) return 1.0; // Exact match
  // Same region check
  for (const [, districts] of Object.entries(REGION_GROUPS)) {
    if (
      districts.includes(collegeDistrict) &&
      districts.includes(preferredDistrict)
    ) {
      return 0.7; // Same region
    }
  }
  return 0.3; // Different region
}

function calculateBranchPopularity(branchCode) {
  const branch = branchesData.find((b) => b.code === branchCode);
  if (!branch) return 0.5;
  return Math.min(1.0, branch.popularity / 100);
}

function calculateCollegeReputation(record) {
  let score = 0.5;
  // College type bonus
  if (record.type === "University") score += 0.2;
  else if (record.type === "Self Finance" || record.type === "Self Supporting")
    score += 0.15;
  else if (record.type === "Private University") score += 0.1;
  // Established year bonus (older = more reputable)
  const age = 2024 - record.established;
  if (age > 50) score += 0.2;
  else if (age > 30) score += 0.15;
  else if (age > 15) score += 0.1;
  else if (age > 5) score += 0.05;
  // Lower OC cutoff = more competitive = more reputable
  const ocCutoff = record.cutoffs["OC_BOYS"];
  if (ocCutoff && ocCutoff < 10000) score += 0.1;
  else if (ocCutoff && ocCutoff < 30000) score += 0.05;
  return Math.min(1.0, score);
}

function scoreCollege(record, input) {
  const cutoffKey = getCutoffKey(input.category, input.gender);
  const closingRank = record.cutoffs[cutoffKey];
  if (closingRank === null || closingRank === undefined) return null;
  const rankGap = closingRank - input.rank;
  // Calculate individual scores
  const rankSimilarity = calculateRankSimilarity(input.rank, closingRank);
  const feeMatch = calculateFeeMatch(record.fee, input.budget);
  const locationMatch = calculateLocationMatch(
    record.district,
    input.district,
    record.academicRegion,
  );
  const branchPopularity = calculateBranchPopularity(record.branchCode);
  const collegeReputation = calculateCollegeReputation(record);
  // Weighted final score
  const finalScore =
    0.4 * rankSimilarity +
    0.2 * feeMatch +
    0.15 * locationMatch +
    0.15 * branchPopularity +
    0.1 * collegeReputation;
  // Convert to probability percentage
  const probability = Math.round(Math.min(99, Math.max(1, finalScore * 100)));
  // Classify chance level
  
  // Classify chance level based on strict rank boundaries
  let chanceLevel;
  const uRank = parseInt(input.rank);
  const cRank = closingRank;
  
  if (cRank >= uRank - 10000 && cRank <= uRank + 10000) {
    chanceLevel = "best-fit";
  } else if (cRank > uRank + 10000) {
    chanceLevel = "high";
  } else if (cRank >= uRank - 30000 && cRank < uRank - 10000) {
    chanceLevel = "medium";
  } else {
    chanceLevel = "low";
  }
  // Calculate counseling round probabilities
  const round1Prob = probability;
  const round2Prob = Math.min(99, Math.round(probability * 1.12)); // ~12% relaxation
  const finalPhasePorb = Math.min(99, Math.round(probability * 1.25)); // ~25% relaxation
  return {
    college: record,
    probability,
    chanceLevel,
    rankGap,
    closingRank,
    scores: {
      rankSimilarity: Math.round(rankSimilarity * 100),
      feeMatch: Math.round(feeMatch * 100),
      locationMatch: Math.round(locationMatch * 100),
      branchPopularity: Math.round(branchPopularity * 100),
      collegeReputation: Math.round(collegeReputation * 100),
    },
    insight: "", // Will be filled by insights generator
    counselingRounds: {
      round1: round1Prob,
      round2: round2Prob,
      finalPhase: finalPhasePorb,
    },
  };
}

// ─────────────────────────────────────────────────────────────
// INSIGHTS GENERATOR
// ─────────────────────────────────────────────────────────────

function generateInsight(prediction, input) {
  const { college, probability, rankGap, closingRank } = prediction;
  const cutoffKey = getCutoffKey(input.category, input.gender);
  let insight = "";
  if (rankGap > 0) {
    insight += `Your rank (${input.rank.toLocaleString()}) is ${rankGap.toLocaleString()} positions better than the ${input.category} ${input.gender} closing rank of ${closingRank.toLocaleString()}. `;
    if (rankGap > closingRank * 0.3) {
      insight += "Very comfortable margin — high confidence in admission. ";
    } else if (rankGap > closingRank * 0.1) {
      insight += "Good margin for admission. ";
    } else {
      insight += "Tight margin — admission possible but competitive. ";
    }
  } else {
    insight += `Your rank (${input.rank.toLocaleString()}) exceeds the closing rank of ${closingRank.toLocaleString()} by ${Math.abs(rankGap).toLocaleString()} positions. `;
    insight += "Admission unlikely unless seats remain in later rounds. ";
  }
  if (input.budget > 0) {
    if (college.fee <= input.budget * 0.7) {
      insight += `Fee ₹${college.fee.toLocaleString()} is well within your budget. `;
    } else if (college.fee <= input.budget) {
      insight += `Fee ₹${college.fee.toLocaleString()} fits within your ₹${input.budget.toLocaleString()} budget. `;
    }
  }
  if (input.district !== "ALL" && college.district === input.district) {
    insight += `Located in your preferred district (${college.districtFull}). `;
  }
  return insight.trim();
}

// ─────────────────────────────────────────────────────────────
// ANALYTICS GENERATOR
// ─────────────────────────────────────────────────────────────

function generateAnalytics(predictions, input, filtered) {
  const bestFit = predictions.filter((p) => p.chanceLevel === "best-fit");
  const high = predictions.filter((p) => p.chanceLevel === "high");
  const medium = predictions.filter((p) => p.chanceLevel === "medium");
  const low = predictions.filter((p) => p.chanceLevel === "low");
  // Estimate percentile
  const percentile = Math.max(
    0.1,
    Math.round((1 - input.rank / TOTAL_STUDENTS) * 10000) / 100,
  );
  // Branch competition
  const branchMap = new Map();
  for (const rec of allRecords) {
    const cutoff = rec.cutoffs["OC_BOYS"];
    if (cutoff) {
      if (!branchMap.has(rec.branchCode))
        branchMap.set(rec.branchCode, { total: 0, count: 0 });
      const b = branchMap.get(rec.branchCode);
      b.total += cutoff;
      b.count++;
    }
  }
  const branchCompetition = Array.from(branchMap.entries())
    .map(([code, stats]) => {
      const avg = Math.round(stats.total / stats.count);
      let level = "Low";
      if (avg < 50000) level = "Very High";
      else if (avg < 100000) level = "High";
      else if (avg < 150000) level = "Medium";
      return {
        branch: code,
        branchName: BRANCH_NAMES[code] || code,
        avgCutoff: avg,
        colleges: stats.count,
        competitionLevel: level,
      };
    })
    .sort((a, b) => a.avgCutoff - b.avgCutoff)
    .slice(0, 15);
  // District popularity
  const districtMap = new Map();
  for (const rec of filtered) {
    if (!districtMap.has(rec.district))
      districtMap.set(rec.district, { count: 0, totalCutoff: 0 });
    const d = districtMap.get(rec.district);
    d.count++;
    const cutoffKey = getCutoffKey(input.category, input.gender);
    const cutoff = rec.cutoffs[cutoffKey];
    if (cutoff) d.totalCutoff += cutoff;
  }
  const districtPopularity = Array.from(districtMap.entries())
    .map(([code, stats]) => ({
      district: code,
      districtFull: DISTRICT_NAMES[code] || code,
      colleges: stats.count,
      avgCutoff:
        stats.count > 0 ? Math.round(stats.totalCutoff / stats.count) : 0,
    }))
    .sort((a, b) => b.colleges - a.colleges);
  // Fee distribution
  const feeRanges = [
    { range: "< ₹40K", min: 0, max: 40000, count: 0 },
    { range: "₹40K-60K", min: 40000, max: 60000, count: 0 },
    { range: "₹60K-80K", min: 60000, max: 80000, count: 0 },
    { range: "₹80K-1L", min: 80000, max: 100000, count: 0 },
    { range: "₹1L-1.5L", min: 100000, max: 150000, count: 0 },
    { range: "> ₹1.5L", min: 150000, max: 999999, count: 0 },
  ];
  for (const pred of predictions) {
    for (const range of feeRanges) {
      if (pred.college.fee >= range.min && pred.college.fee < range.max) {
        range.count++;
        break;
      }
    }
  }
  // Cutoff distribution
  const cutoffRanges = [
    { range: "< 10K", count: 0 },
    { range: "10K-30K", count: 0 },
    { range: "30K-60K", count: 0 },
    { range: "60K-100K", count: 0 },
    { range: "100K-150K", count: 0 },
    { range: "> 150K", count: 0 },
  ];
  for (const pred of predictions) {
    const rank = pred.closingRank;
    if (rank < 10000) cutoffRanges[0].count++;
    else if (rank < 30000) cutoffRanges[1].count++;
    else if (rank < 60000) cutoffRanges[2].count++;
    else if (rank < 100000) cutoffRanges[3].count++;
    else if (rank < 150000) cutoffRanges[4].count++;
    else cutoffRanges[5].count++;
  }
  return {
    rank: input.rank,
    estimatedPercentile: percentile,
    studentsAhead: input.rank - 1,
    totalStudents: TOTAL_STUDENTS,
    eligibleColleges: predictions.length,
    bestFitCount: bestFit.length,
    highChanceCount: high.length,
    mediumChanceCount: medium.length,
    lowChanceCount: low.length,
    bestMatch:
      high.length > 0
        ? high[0].college.collegeName
        : medium.length > 0
          ? medium[0].college.collegeName
          : null,
    branchCompetition,
    districtPopularity,
    feeDistribution: feeRanges,
    cutoffDistribution: cutoffRanges,
  };
}

// ─────────────────────────────────────────────────────────────
// MAIN PREDICTION FUNCTION
// ─────────────────────────────────────────────────────────────

export async function predict(input) {
  // Layer 1: Rule Engine — Filter
  const filtered = applyRuleEngine(allRecords, input);
  // Call Python ML Backend
  let rawPredictions = [];
  try {
    const response = await fetch("http://127.0.0.1:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (response.ok) {
      rawPredictions = await response.json();
    } else {
      console.error("ML API returned error:", await response.text());
    }
  } catch (err) {
    console.error("Failed to fetch ML predictions:", err);
  }
  // Layer 2: Map predictions back to CollegePrediction objects
  const predictions = [];
  for (const raw of rawPredictions) {
    const record = filtered.find(
      (r) => r.instCode === raw.inst_code && r.branchCode === raw.branch_code,
    );
    if (!record) continue;
    const probability = raw.probability;
    
    // Apply strict rank-based chanceLevel classification over ML classification
    let chanceLevel;
    const uRank = parseInt(input.rank);
    const cRank = raw.closing_rank;
    const rankGap = cRank - uRank;
    
    let adjustedProb = probability;

    if (cRank >= uRank - 10000 && cRank <= uRank + 10000) {
      chanceLevel = "best-fit";
      // Scale from 65% to 85% based on rank gap
      adjustedProb = 75 + Math.round((rankGap / 10000) * 10);
    } else if (cRank > uRank + 10000) {
      chanceLevel = "high";
      adjustedProb = Math.max(86, probability);
    } else if (cRank >= uRank - 30000 && cRank < uRank - 10000) {
      chanceLevel = "medium";
      // Scale from 40% to 64%
      const ratio = (rankGap + 30000) / 20000;
      adjustedProb = 40 + Math.round(ratio * 24);
    } else {
      chanceLevel = "low";
      adjustedProb = Math.min(39, probability);
      if (adjustedProb === 0) adjustedProb = Math.floor(Math.random() * 15) + 5; // 5-20% instead of 0%
    }
    
    const prediction = {
      college: record,
      probability: adjustedProb,
      chanceLevel,
      rankGap: raw.rankGap,
      closingRank: raw.closing_rank,
      scores: {
        rankSimilarity: 0,
        feeMatch: 0,
        locationMatch: 0,
        branchPopularity: 0,
        collegeReputation: 0,
      },
      insight: "",
      counselingRounds: {
        round1: adjustedProb,
        round2: Math.min(99, Math.round(adjustedProb * 1.12)),
        finalPhase: Math.min(99, Math.round(adjustedProb * 1.25)),
      },
    };
    prediction.insight = generateInsight(prediction, input);
    predictions.push(prediction);
  }
  // Sort by probability (descending)
  predictions.sort((a, b) => b.probability - a.probability);
  // 3. Assemble results dynamically for Best Fit
  const bestFitChance = predictions
    .filter((p) => p.chanceLevel === "best-fit")
    .sort((a, b) => b.probability - a.probability || a.college.fee - b.college.fee);
    
  const highChance = predictions
    .filter((p) => p.chanceLevel === "high")
    .sort((a, b) => b.probability - a.probability || b.scores.collegeReputation - a.scores.collegeReputation);
    
  const mediumChance = predictions.filter((p) => p.chanceLevel === "medium");
  const lowChance = predictions.filter((p) => p.chanceLevel === "low");
  // Generate analytics
  const analytics = generateAnalytics(predictions, input, filtered);

  return {
    bestFitChance,
    highChance,
    mediumChance,
    lowChance,
    analytics,
    studentInput: input,
  };
}

// Export for use in recommendation engine
export { allRecords, TOTAL_STUDENTS };
