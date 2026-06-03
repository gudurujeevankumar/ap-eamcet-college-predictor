"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  GraduationCap,
  TrendingUp,
  MapPin,
  IndianRupee,
  Building2,
  ChevronDown,
  Sparkles,
  BarChart3,
  Target,
  Users,
  BookOpen,
  Lightbulb,
  X,
  Brain,
  Zap,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Trophy,
  Compass,
  CalendarDays,
  Mail,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Custom Brand Icons
const InstagramIcon = ({ size = 18, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const YoutubeIcon = ({ size = 18, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const LinkedinIcon = ({ size = 18, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);
import {
  CATEGORIES,
  BRANCH_NAMES,
  DISTRICT_NAMES,
  FEE_RANGES,
  COLLEGE_TYPE_MAP,
} from "./lib/types";
import { predict } from "./lib/prediction-engine";
import branchesData from "./data/branches.json";
import districtsData from "./data/districts.json";

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const COLLEGE_TYPES = [
  { label: "All Types", value: "All" },
  { label: "Private", value: "Private" },
  { label: "University", value: "University" },
  { label: "Self Finance", value: "Self Finance" },
  { label: "Self Supporting", value: "Self Supporting" },
  { label: "Private University", value: "Private University" },
];

const CHART_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#f43f5e",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
];

// ─────────────────────────────────────────────────────────────
// CIRCULAR PROGRESS COMPONENT
// ─────────────────────────────────────────────────────────────

function CircularProgress({ value, size = 64, strokeWidth = 6, level }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const colorMap = { high: "#10b981", medium: "#f59e0b", low: "#f43f5e" };

  return (
    <div className="circular-progress" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorMap[level] || "#3b82f6"}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      <div className="value" style={{ color: colorMap[level] || "#3b82f6" }}>
        {value}%
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COLLEGE CARD COMPONENT
// ─────────────────────────────────────────────────────────────

function CollegeCard({ prediction, index }) {
  const [expanded, setExpanded] = useState(false);
  const {
    college,
    probability,
    chanceLevel,
    rankGap,
    closingRank,
    scores,
    insight,
    counselingRounds,
  } = prediction;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className={`college-card ${chanceLevel}`}
    >
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <CircularProgress value={probability} level={chanceLevel} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#0f172a",
                margin: 0,
              }}
            >
              {college.collegeName}
            </h3>
            <span className={`chance-badge ${chanceLevel}`}>
              {chanceLevel === "best-fit"
                ? "★ Best Fit"
                : chanceLevel === "high"
                ? "✓ High Chance"
                : chanceLevel === "medium"
                  ? "~ Fair Chance"
                  : "✗ Low Chance"}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "8px",
              flexWrap: "wrap",
              fontSize: "13px",
              color: "#64748b",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <BookOpen size={14} /> {college.branchName}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <MapPin size={14} /> {college.districtFull}, {college.place}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <IndianRupee size={14} /> ₹{college.fee?.toLocaleString()}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Building2 size={14} /> {college.type}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "24px",
              marginTop: "12px",
              fontSize: "13px",
            }}
          >
            <div>
              <span style={{ color: "#94a3b8" }}>Closing Rank</span>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>
                {closingRank?.toLocaleString()}
              </div>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Rank Gap</span>
              <div
                style={{
                  fontWeight: 700,
                  color: rankGap > 0 ? "#10b981" : "#f43f5e",
                }}
              >
                {rankGap > 0 ? "+" : ""}
                {rankGap?.toLocaleString()}
              </div>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Affiliation</span>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>
                {college.affiliation}
              </div>
            </div>
            <div>
              <span style={{ color: "#94a3b8" }}>Est.</span>
              <div style={{ fontWeight: 600, color: "#0f172a" }}>
                {college.established}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable section */}
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "12px",
          background: "none",
          border: "none",
          color: "#3b82f6",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "Inter, sans-serif",
          padding: "4px 0",
        }}
      >
        <Lightbulb size={14} />
        AI Insight & Analysis
        <ChevronDown
          size={14}
          style={{
            transform: expanded ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
          }}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: "hidden" }}
          >
            <div className="insight-box" style={{ marginTop: "8px" }}>
              <p
                style={{
                  fontSize: "13px",
                  color: "#475569",
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                <Sparkles
                  size={14}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: "6px",
                    color: "#8b5cf6",
                  }}
                />
                {insight}
              </p>
            </div>

            {/* Score Breakdown */}
            <div className="score-breakdown-grid">
              {[
                {
                  label: "Rank Match",
                  value: scores.rankSimilarity,
                  color: "#3b82f6",
                },
                {
                  label: "Fee Match",
                  value: scores.feeMatch,
                  color: "#10b981",
                },
                {
                  label: "Location",
                  value: scores.locationMatch,
                  color: "#f59e0b",
                },
                {
                  label: "Branch Pop.",
                  value: scores.branchPopularity,
                  color: "#8b5cf6",
                },
                {
                  label: "Reputation",
                  value: scores.collegeReputation,
                  color: "#f43f5e",
                },
              ].map((s) => (
                <div key={s.label} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginBottom: "4px",
                    }}
                  >
                    {s.label}
                  </div>
                  <div className="progress-bar" style={{ marginBottom: "2px" }}>
                    <div
                      style={{
                        width: `${s.value}%`,
                        height: "100%",
                        borderRadius: "4px",
                        background: s.color,
                        transition: "width 0.8s ease",
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: s.color,
                    }}
                  >
                    {s.value}%
                  </div>
                </div>
              ))}
            </div>

            {/* Counseling Rounds */}
            <div
              style={{
                marginTop: "12px",
                padding: "12px",
                background: "#f8fafc",
                borderRadius: "8px",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: 600,
                  color: "#475569",
                  marginBottom: "8px",
                }}
              >
                <CalendarDays
                  size={14}
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginRight: "4px",
                  }}
                />
                Counseling Round Probabilities
              </div>
              <div style={{ display: "flex", gap: "16px" }}>
                {[
                  { label: "Round 1", value: counselingRounds.round1 },
                  { label: "Round 2", value: counselingRounds.round2 },
                  { label: "Final", value: counselingRounds.finalPhase },
                ].map((r) => (
                  <div key={r.label} style={{ flex: 1 }}>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                      {r.label}
                    </div>
                    <div
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color:
                          r.value >= 80
                            ? "#10b981"
                            : r.value >= 50
                              ? "#f59e0b"
                              : "#f43f5e",
                      }}
                    >
                      {r.value}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE COMPONENT
// ─────────────────────────────────────────────────────────────

export default function Home() {
  // Form state
  const [rank, setRank] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("Male");
  const [branch, setBranch] = useState("ALL");
  const [district, setDistrict] = useState("ALL");
  const [budget, setBudget] = useState("0");
  const [collegeType, setCollegeType] = useState("All");

  // Results state
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBotVisible, setIsBotVisible] = useState(false);

  // Show bot after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsBotVisible(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  // UI state
  const [activeTab, setActiveTab] = useState("predictions");
  const [visitorCount, setVisitorCount] = useState(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem("hasVisited_EAPCET");
    const endpoint = hasVisited 
      ? "https://api.counterapi.dev/v1/ap-eamcet-predictor-2026/visits" // Only fetch count
      : "https://api.counterapi.dev/v1/ap-eamcet-predictor-2026/visits/up"; // Fetch and increment

    fetch(endpoint)
      .then((res) => res.json())
      .then((data) => {
        setVisitorCount(data.count + 35); // Offset existing visitors
        if (!hasVisited) {
          localStorage.setItem("hasVisited_EAPCET", "true");
        }
      })
      .catch(() => setVisitorCount(36));
  }, []);
  const [activeChanceFilter, setActiveChanceFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeChanceFilter, searchQuery, result]);

  // Sort branches alphabetically by name for the dropdown
  const sortedBranches = [...branchesData].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  const handlePredict = useCallback(async () => {
    if (!rank || !category) {
      setError("Please enter your rank and select a category.");
      return;
    }
    const rankNum = parseInt(rank, 10);
    if (isNaN(rankNum) || rankNum < 1 || rankNum > 300000) {
      setError("Please enter a valid rank between 1 and 3,00,000.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await predict({
        rank: rankNum,
        category,
        gender,
        branch,
        district,
        budget: parseInt(budget, 10) || 0,
        collegeType,
        region: "ALL",
      });

      setResult(data);
      setActiveTab("predictions");

      // Scroll to results
      setTimeout(() => {
        document
          .getElementById("results-section")
          ?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [rank, category, gender, branch, district, budget, collegeType]);

  // Filter predictions
  const getFilteredPredictions = () => {
    if (!result) return [];
    let predictions = [];

    if (activeChanceFilter === "all" || activeChanceFilter === "best-fit")
      predictions.push(...(result.bestFitChance || []));
    if (activeChanceFilter === "all" || activeChanceFilter === "high")
      predictions.push(...result.highChance);
    if (activeChanceFilter === "all" || activeChanceFilter === "medium")
      predictions.push(...result.mediumChance);
    if (activeChanceFilter === "all" || activeChanceFilter === "low")
      predictions.push(...result.lowChance);

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      predictions = predictions.filter(
        (p) =>
          p.college.collegeName.toLowerCase().includes(q) ||
          p.college.branchName.toLowerCase().includes(q) ||
          p.college.districtFull.toLowerCase().includes(q) ||
          p.college.place?.toLowerCase().includes(q),
      );
    }

    return predictions;
  };

  return (
    <main>
      <style>{`
        .hero-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          max-width: 600px;
          margin: 0 auto 32px;
        }
        .hero-content {
          text-align: center;
          margin-bottom: 40px;
        }
        .analysis-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
        }
        .score-breakdown-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-top: 12px;
        }
        @media (max-width: 768px) {
          .hero-stats-grid { display: none !important; }
          .hero-content { margin-bottom: 24px !important; }
          .analysis-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .score-breakdown-grid { grid-template-columns: repeat(3, 1fr); }
          .tabs { flex-wrap: wrap; }
          .form-section-wrapper { padding: 0 16px !important; margin-top: -24px !important; }
          .hero-section-wrapper { padding: 24px 16px 48px !important; }
          .glass-card { background: white !important; }
        }
      `}</style>
      {/* ─── HERO SECTION ─── */}
      <section
        className="hero-bg hero-section-wrapper"
        style={{ padding: "48px 24px 56px", position: "relative" }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Nav */}
          <nav
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "40px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <GraduationCap size={24} color="white" />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "20px",
                    fontWeight: 800,
                    color: "white",
                    margin: 0,
                    letterSpacing: "-0.025em",
                  }}
                >
                  EAPCET PREDICTOR
                </h1>
                <p
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    margin: 0,
                    letterSpacing: "0.05em",
                  }}
                >
                  AI-POWERED • 2026
                </p>
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: "rgba(16, 185, 129, 0.15)",
                  color: "#34d399",
                }}
              >
                271 Colleges • 69 Branches
              </span>
              {visitorCount !== null && (
                <span
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "12px",
                    fontWeight: 600,
                    background: "rgba(59, 130, 246, 0.15)",
                    color: "#60a5fa",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <Users size={14} />
                  {visitorCount}+ Visitors
                </span>
              )}
            </div>
          </nav>

          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hero-content"
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 16px",
                borderRadius: "20px",
                marginBottom: "16px",
                background: "rgba(59, 130, 246, 0.15)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              <Brain size={14} color="#60a5fa" />
              <span
                style={{ fontSize: "13px", color: "#93c5fd", fontWeight: 500 }}
              >
                Powered by Predictive Analytics & Machine Learning
              </span>
            </div>
            <h2
              style={{
                fontSize: "clamp(28px, 5vw, 44px)",
                fontWeight: 900,
                color: "white",
                margin: "0 0 12px",
                letterSpacing: "-0.04em",
                lineHeight: 1.15,
              }}
            >
              Find Your Perfect College
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #60a5fa, #a78bfa, #34d399)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                with AI Predictions
              </span>
            </h2>
            <p
              style={{
                fontSize: "16px",
                color: "#94a3b8",
                maxWidth: "600px",
                margin: "0 auto",
                lineHeight: 1.6,
              }}
            >
              Predict your admission probability across 271+ AP engineering
              colleges using real cutoff data, intelligent scoring, and
              personalized recommendations.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="hero-stats-grid"
          >
            {[
              {
                icon: <Building2 size={18} />,
                value: "271+",
                label: "Colleges",
              },
              { icon: <BookOpen size={18} />, value: "69", label: "Branches" },
              { icon: <MapPin size={18} />, value: "13", label: "Districts" },
              {
                icon: <Shield size={18} />,
                value: "1565",
                label: "Data Points",
              },
            ].map((stat, i) => (
              <div
                key={i}
                className="glass-card-dark"
                style={{ padding: "16px", textAlign: "center" }}
              >
                <div
                  style={{
                    color: "#60a5fa",
                    marginBottom: "6px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {stat.icon}
                </div>
                <div
                  style={{ fontSize: "22px", fontWeight: 800, color: "white" }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── PREDICTION FORM ─── */}
      <section
        className="form-section-wrapper"
        style={{
          maxWidth: "1200px",
          margin: "24px auto 0",
          padding: "0 24px",
          position: "relative",
          zIndex: 2,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="glass-card"
          style={{ padding: "32px", boxShadow: "var(--shadow-elevated)" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: 800,
                  color: "#0f172a",
                  margin: 0,
                }}
              >
                Enter Your Details
              </h2>
              <p
                style={{
                  fontSize: "13px",
                  color: "#94a3b8",
                  margin: "4px 0 0",
                }}
              >
                Fill in your EAPCET details to get personalized predictions
              </p>
            </div>
            <div
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                background: "#fef3c7",
                color: "#92400e",
                border: "1px solid #fde68a",
              }}
            >
              No OTP Required
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "16px",
            }}
          >
            {/* Rank */}
            <div>
              <label className="form-label">EAPCET Rank *</label>
              <input
                type="number"
                className="form-input"
                placeholder="Ex: 45678"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                min={1}
                max={300000}
                id="input-rank"
              />
            </div>

            {/* Category */}
            <div>
              <label className="form-label">Category *</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                id="input-category"
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender */}
            <div>
              <label className="form-label">Gender</label>
              <div className="gender-toggle">
                <button
                  className={`gender-option ${gender === "Male" ? "active" : ""}`}
                  onClick={() => setGender("Male")}
                  id="input-gender-male"
                >
                  Male
                </button>
                <button
                  className={`gender-option ${gender === "Female" ? "active" : ""}`}
                  onClick={() => setGender("Female")}
                  id="input-gender-female"
                >
                  Female
                </button>
              </div>
            </div>

            {/* College Type */}
            <div>
              <label className="form-label">College Type</label>
              <select
                className="form-select"
                value={collegeType}
                onChange={(e) => setCollegeType(e.target.value)}
                id="input-college-type"
              >
                {COLLEGE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="form-label">Preferred District</label>
              <select
                className="form-select"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                id="input-district"
              >
                <option value="ALL">All Districts</option>
                {districtsData.map((d) => (
                  <option key={d.code} value={d.code}>
                    {d.name} ({d.totalColleges} colleges)
                  </option>
                ))}
              </select>
            </div>

            {/* Branch */}
            <div>
              <label className="form-label">Preferred Course</label>
              <select
                className="form-select"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                id="input-branch"
              >
                <option value="ALL">All Courses</option>
                {sortedBranches.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name} ({b.colleges})
                  </option>
                ))}
              </select>
            </div>

            {/* Budget */}
            <div>
              <label className="form-label">Tuition Budget</label>
              <select
                className="form-select"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                id="input-budget"
              >
                {FEE_RANGES.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Predict Button */}
            <div style={{ display: "flex", alignItems: "flex-end" }}>
              <button
                className="btn-primary"
                onClick={handlePredict}
                disabled={loading}
                style={{ width: "100%", height: "48px" }}
                id="btn-predict"
              >
                {loading ? (
                  <>
                    <div className="spinner" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search size={18} />
                    Predict Colleges
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: "16px",
                padding: "12px 16px",
                borderRadius: "10px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <AlertTriangle size={16} /> {error}
            </motion.div>
          )}
        </motion.div>
      </section>

      {/* ─── VIDEO TUTORIAL SECTION ─── */}
      {!result && (
        <section
          style={{
            maxWidth: "800px",
            margin: "48px auto 0",
            padding: "0 24px",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a" }}>
              How to use this Predictor
            </h2>
            <p style={{ fontSize: "14px", color: "#64748b", marginTop: "8px" }}>
              Watch this quick Telugu tutorial to understand how to get the most accurate college predictions based on your rank.
            </p>
          </div>
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%", /* 16:9 aspect ratio */
              height: 0,
              overflow: "hidden",
              borderRadius: "16px",
              boxShadow: "var(--shadow-elevated)",
              border: "1px solid rgba(0,0,0,0.1)"
            }}
          >
            <iframe
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
              src="https://www.youtube.com/embed/QNZ4iP0gZMI?start=200&end=400"
              title="AP EAMCET College Predictor Tutorial"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </section>
      )}

      {/* ─── RESULTS SECTION ─── */}
      <AnimatePresence>
        {result && (
          <motion.section
            id="results-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              maxWidth: "1200px",
              margin: "32px auto 0",
              padding: "0 24px 64px",
            }}
          >
            {/* ─── RANK ANALYSIS CARDS ─── */}
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <h2 className="section-title">
                  <Target
                    size={24}
                    style={{
                      display: "inline",
                      verticalAlign: "middle",
                      marginRight: "8px",
                      color: "#3b82f6",
                    }}
                  />
                  Your Rank Analysis
                </h2>
              </div>

              <div className="analysis-stats-grid">
                {[
                  {
                    icon: <Target size={22} />,
                    iconBg: "#eff6ff",
                    iconColor: "#3b82f6",
                    value: result.analytics.rank.toLocaleString(),
                    label: "Your Rank",
                  },
                  {
                    icon: <Users size={22} />,
                    iconBg: "#f0fdf4",
                    iconColor: "#10b981",
                    value: result.analytics.studentsAhead.toLocaleString(),
                    label: "Students Ahead",
                  },
                  {
                    icon: <TrendingUp size={22} />,
                    iconBg: "#fdf4ff",
                    iconColor: "#a855f7",
                    value: `${result.analytics.estimatedPercentile}%`,
                    label: "Percentile",
                  },
                  {
                    icon: <Building2 size={22} />,
                    iconBg: "#fff7ed",
                    iconColor: "#f59e0b",
                    value: result.analytics.eligibleColleges.toString(),
                    label: "Eligible Colleges",
                  },
                ].map((card, i) => (
                  <motion.div
                    key={card.label}
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "12px",
                        background: card.iconBg,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: card.iconColor,
                        marginBottom: "12px",
                      }}
                    >
                      {card.icon}
                    </div>
                    <div
                      style={{
                        fontSize: "28px",
                        fontWeight: 800,
                        color: "#0f172a",
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {card.value}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "#94a3b8",
                        fontWeight: 500,
                      }}
                    >
                      {card.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* ─── PREDICTION SUMMARY ─── */}
            <div
              className="analysis-stats-grid"
              style={{ marginBottom: "32px" }}
            >
              {[
                {
                  icon: <Compass size={22} />,
                  bg: "linear-gradient(135deg, #eff6ff, #dbeafe)",
                  color: "#2563eb",
                  value: result.analytics.bestFitCount || 0,
                  label: "Best Matches",
                },
                {
                  icon: <CheckCircle2 size={22} />,
                  bg: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                  color: "#059669",
                  value: result.analytics.highChanceCount,
                  label: "High Chance",
                },
                {
                  icon: <Zap size={22} />,
                  bg: "linear-gradient(135deg, #fffbeb, #fef3c7)",
                  color: "#d97706",
                  value: result.analytics.mediumChanceCount,
                  label: "Fair Chance",
                },
                {
                  icon: <AlertTriangle size={22} />,
                  bg: "linear-gradient(135deg, #fff1f2, #ffe4e6)",
                  color: "#dc2626",
                  value: result.analytics.lowChanceCount,
                  label: "Low Chance",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.label}
                  className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  style={{ background: card.bg }}
                >
                  <div style={{ color: card.color, marginBottom: "8px" }}>
                    {card.icon}
                  </div>
                  <div
                    style={{
                      fontSize: "32px",
                      fontWeight: 800,
                      color: card.color,
                      letterSpacing: "-0.025em",
                    }}
                  >
                    {card.value}
                  </div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      fontWeight: 500,
                    }}
                  >
                    {card.label}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ─── TABS ─── */}
            <div
              className="tabs"
              style={{
                marginBottom: "24px",
                maxWidth: "500px",
                display: "flex",
              }}
            >
              {[
                {
                  key: "predictions",
                  label: "College Predictions",
                  icon: <GraduationCap size={16} />,
                },
                {
                  key: "analytics",
                  label: "Analytics",
                  icon: <BarChart3 size={16} />,
                },
                {
                  key: "counseling",
                  label: "Counseling Sim",
                  icon: <CalendarDays size={16} />,
                },
              ].map((tab) => (
                <button
                  key={tab.key}
                  className={`tab ${activeTab === tab.key ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* ─── PREDICTIONS TAB ─── */}
            {activeTab === "predictions" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Filters */}
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "20px",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{ flex: 1, minWidth: "250px", position: "relative" }}
                  >
                    <Search
                      size={16}
                      style={{
                        position: "absolute",
                        left: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#94a3b8",
                      }}
                    />
                    <input
                      className="form-input"
                      placeholder="Search colleges, branches, districts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ paddingLeft: "40px" }}
                      id="search-colleges"
                    />

                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        style={{
                          position: "absolute",
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "none",
                          border: "none",
                          color: "#94a3b8",
                          cursor: "pointer",
                        }}
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {[
                      { key: "all", label: "All" },
                      {
                        key: "best-fit",
                        label: `Best Fit (${result.bestFitChance?.length || 0})`,
                      },
                      {
                        key: "high",
                        label: `High (${result.highChance.length})`,
                      },
                      {
                        key: "medium",
                        label: `Medium (${result.mediumChance.length})`,
                      },
                      { key: "low", label: `Low (${result.lowChance.length})` },
                    ].map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setActiveChanceFilter(f.key)}
                        style={{
                          padding: "8px 16px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 500,
                          border: "1px solid",
                          cursor: "pointer",
                          fontFamily: "Inter, sans-serif",
                          transition: "all 0.2s",
                          background:
                            activeChanceFilter === f.key ? "#3b82f6" : "white",
                          color:
                            activeChanceFilter === f.key ? "white" : "#64748b",
                          borderColor:
                            activeChanceFilter === f.key
                              ? "#3b82f6"
                              : "#e2e8f0",
                        }}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* College Cards */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {getFilteredPredictions().length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "64px 24px",
                        background: "#f8fafc",
                        borderRadius: "16px",
                        border: "1px dashed #e2e8f0",
                      }}
                    >
                      <Search
                        size={40}
                        style={{ color: "#cbd5e1", margin: "0 auto 16px" }}
                      />
                      <p
                        style={{
                          fontSize: "16px",
                          color: "#64748b",
                          fontWeight: 500,
                          margin: "0 0 4px",
                        }}
                      >
                        No colleges found
                      </p>
                      <p style={{ fontSize: "13px", color: "#94a3b8" }}>
                        Try adjusting your filters or search criteria
                      </p>
                    </div>
                  ) : (
                    (() => {
                      const filtered = getFilteredPredictions();
                      const paginated = filtered.slice(
                        (currentPage - 1) * ITEMS_PER_PAGE,
                        currentPage * ITEMS_PER_PAGE,
                      );
                      return (
                        <>
                          {paginated.map((p, i) => (
                            <CollegeCard
                              key={`${p.college.instCode}-${p.college.branchCode}-${i}`}
                              prediction={p}
                              index={i}
                            />
                          ))}

                          {filtered.length > ITEMS_PER_PAGE && (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: "16px",
                                marginTop: "16px",
                              }}
                            >
                              <button
                                onClick={() => {
                                  setCurrentPage((prev) =>
                                    Math.max(prev - 1, 1),
                                  );
                                  document
                                    .getElementById("results-section")
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }}
                                disabled={currentPage === 1}
                                style={{
                                  padding: "8px 20px",
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0",
                                  background:
                                    currentPage === 1 ? "#f8fafc" : "white",
                                  color:
                                    currentPage === 1 ? "#94a3b8" : "#3b82f6",
                                  cursor:
                                    currentPage === 1
                                      ? "not-allowed"
                                      : "pointer",
                                  fontWeight: 600,
                                  fontSize: "14px",
                                  transition: "all 0.2s",
                                }}
                              >
                                Previous
                              </button>
                              <span
                                style={{
                                  fontSize: "14px",
                                  color: "#64748b",
                                  fontWeight: 500,
                                }}
                              >
                                Page {currentPage} of{" "}
                                {Math.ceil(filtered.length / ITEMS_PER_PAGE)}
                              </span>
                              <button
                                onClick={() => {
                                  setCurrentPage((prev) =>
                                    Math.min(
                                      prev + 1,
                                      Math.ceil(
                                        filtered.length / ITEMS_PER_PAGE,
                                      ),
                                    ),
                                  );
                                  document
                                    .getElementById("results-section")
                                    ?.scrollIntoView({ behavior: "smooth" });
                                }}
                                disabled={
                                  currentPage ===
                                  Math.ceil(filtered.length / ITEMS_PER_PAGE)
                                }
                                style={{
                                  padding: "8px 20px",
                                  borderRadius: "8px",
                                  border: "1px solid #e2e8f0",
                                  background:
                                    currentPage ===
                                    Math.ceil(filtered.length / ITEMS_PER_PAGE)
                                      ? "#f8fafc"
                                      : "white",
                                  color:
                                    currentPage ===
                                    Math.ceil(filtered.length / ITEMS_PER_PAGE)
                                      ? "#94a3b8"
                                      : "#3b82f6",
                                  cursor:
                                    currentPage ===
                                    Math.ceil(filtered.length / ITEMS_PER_PAGE)
                                      ? "not-allowed"
                                      : "pointer",
                                  fontWeight: 600,
                                  fontSize: "14px",
                                  transition: "all 0.2s",
                                }}
                              >
                                Next
                              </button>
                            </div>
                          )}
                        </>
                      );
                    })()
                  )}
                </div>

                {getFilteredPredictions().length > 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      marginTop: "24px",
                      fontSize: "13px",
                      color: "#94a3b8",
                    }}
                  >
                    Showing {getFilteredPredictions().length} college
                    predictions • Data based on 2024 cutoffs
                  </div>
                )}
              </motion.div>
            )}

            {/* ─── ANALYTICS TAB ─── */}
            {activeTab === "analytics" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
                    gap: "24px",
                  }}
                >
                  {/* Cutoff Distribution */}
                  <div className="stat-card">
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        marginBottom: "16px",
                        color: "#0f172a",
                      }}
                    >
                      <BarChart3
                        size={18}
                        style={{
                          display: "inline",
                          verticalAlign: "middle",
                          marginRight: "8px",
                          color: "#3b82f6",
                        }}
                      />
                      Cutoff Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={result.analytics.cutoffDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="range"
                          tick={{ fontSize: 12, fill: "#94a3b8" }}
                        />
                        <YAxis tick={{ fontSize: 12, fill: "#94a3b8" }} />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
                          }}
                        />

                        <Bar
                          dataKey="count"
                          fill="url(#colorGradient)"
                          radius={[6, 6, 0, 0]}
                        />
                        <defs>
                          <linearGradient
                            id="colorGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Fee Analysis */}
                  <div className="stat-card">
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        marginBottom: "16px",
                        color: "#0f172a",
                      }}
                    >
                      <IndianRupee
                        size={18}
                        style={{
                          display: "inline",
                          verticalAlign: "middle",
                          marginRight: "8px",
                          color: "#10b981",
                        }}
                      />
                      Fee Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <PieChart>
                        <Pie
                          data={result.analytics.feeDistribution.filter(
                            (f) => f.count > 0,
                          )}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={4}
                          dataKey="count"
                          nameKey="range"
                        >
                          {result.analytics.feeDistribution
                            .filter((f) => f.count > 0)
                            .map((_, i) => (
                              <Cell
                                key={i}
                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                              />
                            ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        gap: "12px",
                        flexWrap: "wrap",
                        marginTop: "8px",
                      }}
                    >
                      {result.analytics.feeDistribution
                        .filter((f) => f.count > 0)
                        .map((f, i) => (
                          <div
                            key={f.range}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "6px",
                              fontSize: "12px",
                              color: "#64748b",
                            }}
                          >
                            <div
                              style={{
                                width: "10px",
                                height: "10px",
                                borderRadius: "3px",
                                background:
                                  CHART_COLORS[i % CHART_COLORS.length],
                              }}
                            />
                            {f.range} ({f.count})
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Branch Competition */}
                  <div className="stat-card">
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        marginBottom: "16px",
                        color: "#0f172a",
                      }}
                    >
                      <TrendingUp
                        size={18}
                        style={{
                          display: "inline",
                          verticalAlign: "middle",
                          marginRight: "8px",
                          color: "#f59e0b",
                        }}
                      />
                      Branch Competition (Top 10)
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart
                        data={result.analytics.branchCompetition.slice(0, 10)}
                        layout="vertical"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          type="number"
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                        />
                        <YAxis
                          type="category"
                          dataKey="branch"
                          width={45}
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                          }}
                          formatter={(value) => [
                            Number(value).toLocaleString(),
                            "Avg Cutoff",
                          ]}
                        />

                        <Bar dataKey="avgCutoff" radius={[0, 6, 6, 0]}>
                          {result.analytics.branchCompetition
                            .slice(0, 10)
                            .map((_, i) => (
                              <Cell
                                key={i}
                                fill={CHART_COLORS[i % CHART_COLORS.length]}
                              />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* District Popularity */}
                  <div className="stat-card">
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        marginBottom: "16px",
                        color: "#0f172a",
                      }}
                    >
                      <MapPin
                        size={18}
                        style={{
                          display: "inline",
                          verticalAlign: "middle",
                          marginRight: "8px",
                          color: "#f43f5e",
                        }}
                      />
                      District Popularity
                    </h3>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={result.analytics.districtPopularity}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                          dataKey="district"
                          tick={{ fontSize: 11, fill: "#94a3b8" }}
                        />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} />
                        <RechartsTooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                          }}
                          formatter={(value, name) => {
                            if (name === "colleges") return [value, "Colleges"];
                            return [
                              Number(value).toLocaleString(),
                              "Avg Cutoff",
                            ];
                          }}
                        />

                        <Bar
                          dataKey="colleges"
                          fill="url(#districtGradient)"
                          radius={[6, 6, 0, 0]}
                        />
                        <defs>
                          <linearGradient
                            id="districtGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop offset="0%" stopColor="#f43f5e" />
                            <stop offset="100%" stopColor="#fb7185" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI Recommendation Summary */}
                <div
                  className="insight-box"
                  style={{ marginTop: "24px", padding: "24px" }}
                >
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "12px",
                    }}
                  >
                    <Sparkles
                      size={18}
                      style={{
                        display: "inline",
                        verticalAlign: "middle",
                        marginRight: "8px",
                        color: "#8b5cf6",
                      }}
                    />
                    AI Recommendation Summary
                  </h3>
                  <p
                    style={{
                      fontSize: "14px",
                      color: "#475569",
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    Based on your rank of{" "}
                    <strong>{result.analytics.rank.toLocaleString()}</strong> (
                    {result.studentInput.category}, {result.studentInput.gender}
                    ), you are in the{" "}
                    <strong>top {result.analytics.estimatedPercentile}%</strong>{" "}
                    of AP EAPCET candidates.
                    {result.analytics.highChanceCount > 0 && (
                      <>
                        {" "}
                        You have{" "}
                        <strong>
                          {result.analytics.highChanceCount} high-probability
                        </strong>{" "}
                        college options.{" "}
                      </>
                    )}
                    {result.analytics.bestMatch && (
                      <>
                        {" "}
                        Your best match is{" "}
                        <strong>{result.analytics.bestMatch}</strong>.
                      </>
                    )}
                    {result.studentInput.branch !== "ALL" && (
                      <>
                        {" "}
                        For{" "}
                        <strong>
                          {BRANCH_NAMES[result.studentInput.branch] ||
                            result.studentInput.branch}
                        </strong>
                        , the competition level is{" "}
                        {result.analytics.branchCompetition.find(
                          (b) => b.branch === result.studentInput.branch,
                        )?.competitionLevel || "moderate"}
                        .
                      </>
                    )}{" "}
                    We recommend applying to a mix of high and medium chance
                    colleges for the best outcome.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ─── COUNSELING SIMULATOR TAB ─── */}
            {activeTab === "counseling" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="stat-card" style={{ marginBottom: "24px" }}>
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "8px",
                    }}
                  >
                    <CalendarDays
                      size={20}
                      style={{
                        display: "inline",
                        verticalAlign: "middle",
                        marginRight: "8px",
                        color: "#3b82f6",
                      }}
                    />
                    AP EAPCET Counseling Simulator
                  </h3>
                  <p
                    style={{
                      fontSize: "13px",
                      color: "#94a3b8",
                      margin: "0 0 24px",
                    }}
                  >
                    See how your admission chances change across counseling
                    rounds. Later rounds may have relaxed cutoffs.
                  </p>

                  {/* Timeline */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "16px",
                    }}
                  >
                    {[
                      {
                        round: "Round 1",
                        desc: "First Allotment",
                        color: "#3b82f6",
                        bgColor: "#eff6ff",
                        high: result.highChance.filter(
                          (p) => p.counselingRounds.round1 >= 80,
                        ).length,
                        medium: result.mediumChance.filter(
                          (p) => p.counselingRounds.round1 >= 50,
                        ).length,
                        total:
                          result.highChance.length +
                          result.mediumChance.length +
                          result.lowChance.length,
                      },
                      {
                        round: "Round 2",
                        desc: "Second Allotment",
                        color: "#8b5cf6",
                        bgColor: "#f5f3ff",
                        high: [
                          ...result.highChance,
                          ...result.mediumChance,
                        ].filter((p) => p.counselingRounds.round2 >= 80).length,
                        medium: [
                          ...result.mediumChance,
                          ...result.lowChance,
                        ].filter(
                          (p) =>
                            p.counselingRounds.round2 >= 50 &&
                            p.counselingRounds.round2 < 80,
                        ).length,
                        total:
                          result.highChance.length +
                          result.mediumChance.length +
                          result.lowChance.length,
                      },
                      {
                        round: "Final Phase",
                        desc: "Spot/Mop-Up",
                        color: "#10b981",
                        bgColor: "#f0fdf4",
                        high: [
                          ...result.highChance,
                          ...result.mediumChance,
                          ...result.lowChance,
                        ].filter((p) => p.counselingRounds.finalPhase >= 80)
                          .length,
                        medium: [
                          ...result.mediumChance,
                          ...result.lowChance,
                        ].filter(
                          (p) =>
                            p.counselingRounds.finalPhase >= 50 &&
                            p.counselingRounds.finalPhase < 80,
                        ).length,
                        total:
                          result.highChance.length +
                          result.mediumChance.length +
                          result.lowChance.length,
                      },
                    ].map((phase, i) => (
                      <div
                        key={phase.round}
                        style={{
                          padding: "24px",
                          borderRadius: "16px",
                          background: phase.bgColor,
                          border: `1px solid ${phase.color}20`,
                          position: "relative",
                        }}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "12px",
                            background: phase.color,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: 800,
                            fontSize: "16px",
                            marginBottom: "12px",
                          }}
                        >
                          {i + 1}
                        </div>
                        <h4
                          style={{
                            fontSize: "16px",
                            fontWeight: 700,
                            color: "#0f172a",
                            margin: "0 0 4px",
                          }}
                        >
                          {phase.round}
                        </h4>
                        <p
                          style={{
                            fontSize: "12px",
                            color: "#94a3b8",
                            margin: "0 0 16px",
                          }}
                        >
                          {phase.desc}
                        </p>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "8px",
                          }}
                        >
                          <div
                            style={{
                              padding: "12px",
                              borderRadius: "10px",
                              background: "white",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "24px",
                                fontWeight: 800,
                                color: "#10b981",
                              }}
                            >
                              {phase.high}
                            </div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                              High Chance
                            </div>
                          </div>
                          <div
                            style={{
                              padding: "12px",
                              borderRadius: "10px",
                              background: "white",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "24px",
                                fontWeight: 800,
                                color: "#f59e0b",
                              }}
                            >
                              {phase.medium}
                            </div>
                            <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                              Fair Chance
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top picks per round */}
                <div className="stat-card">
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: 700,
                      color: "#0f172a",
                      marginBottom: "16px",
                    }}
                  >
                    <Trophy
                      size={18}
                      style={{
                        display: "inline",
                        verticalAlign: "middle",
                        marginRight: "8px",
                        color: "#f59e0b",
                      }}
                    />
                    Best Picks by Round
                  </h3>
                  <div style={{ overflowX: "auto" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        fontSize: "13px",
                      }}
                    >
                      <thead>
                        <tr style={{ borderBottom: "2px solid #f1f5f9" }}>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "12px 8px",
                              color: "#94a3b8",
                              fontWeight: 600,
                            }}
                          >
                            College
                          </th>
                          <th
                            style={{
                              textAlign: "left",
                              padding: "12px 8px",
                              color: "#94a3b8",
                              fontWeight: 600,
                            }}
                          >
                            Branch
                          </th>
                          <th
                            style={{
                              textAlign: "center",
                              padding: "12px 8px",
                              color: "#3b82f6",
                              fontWeight: 600,
                            }}
                          >
                            Round 1
                          </th>
                          <th
                            style={{
                              textAlign: "center",
                              padding: "12px 8px",
                              color: "#8b5cf6",
                              fontWeight: 600,
                            }}
                          >
                            Round 2
                          </th>
                          <th
                            style={{
                              textAlign: "center",
                              padding: "12px 8px",
                              color: "#10b981",
                              fontWeight: 600,
                            }}
                          >
                            Final
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...result.highChance, ...result.mediumChance]
                          .slice(0, 10)
                          .map((p, i) => (
                            <tr
                              key={i}
                              style={{ borderBottom: "1px solid #f1f5f9" }}
                            >
                              <td
                                style={{
                                  padding: "10px 8px",
                                  fontWeight: 600,
                                  color: "#0f172a",
                                  maxWidth: "200px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {p.college.collegeName}
                              </td>
                              <td
                                style={{
                                  padding: "10px 8px",
                                  color: "#64748b",
                                }}
                              >
                                {p.college.branchCode}
                              </td>
                              <td
                                style={{
                                  textAlign: "center",
                                  padding: "10px 8px",
                                }}
                              >
                                <span
                                  style={{
                                    padding: "3px 10px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    background:
                                      p.counselingRounds.round1 >= 80
                                        ? "#dcfce7"
                                        : p.counselingRounds.round1 >= 50
                                          ? "#fef9c3"
                                          : "#fee2e2",
                                    color:
                                      p.counselingRounds.round1 >= 80
                                        ? "#166534"
                                        : p.counselingRounds.round1 >= 50
                                          ? "#854d0e"
                                          : "#991b1b",
                                  }}
                                >
                                  {p.counselingRounds.round1}%
                                </span>
                              </td>
                              <td
                                style={{
                                  textAlign: "center",
                                  padding: "10px 8px",
                                }}
                              >
                                <span
                                  style={{
                                    padding: "3px 10px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    background:
                                      p.counselingRounds.round2 >= 80
                                        ? "#dcfce7"
                                        : p.counselingRounds.round2 >= 50
                                          ? "#fef9c3"
                                          : "#fee2e2",
                                    color:
                                      p.counselingRounds.round2 >= 80
                                        ? "#166534"
                                        : p.counselingRounds.round2 >= 50
                                          ? "#854d0e"
                                          : "#991b1b",
                                  }}
                                >
                                  {p.counselingRounds.round2}%
                                </span>
                              </td>
                              <td
                                style={{
                                  textAlign: "center",
                                  padding: "10px 8px",
                                }}
                              >
                                <span
                                  style={{
                                    padding: "3px 10px",
                                    borderRadius: "12px",
                                    fontSize: "12px",
                                    fontWeight: 700,
                                    background:
                                      p.counselingRounds.finalPhase >= 80
                                        ? "#dcfce7"
                                        : p.counselingRounds.finalPhase >= 50
                                          ? "#fef9c3"
                                          : "#fee2e2",
                                    color:
                                      p.counselingRounds.finalPhase >= 80
                                        ? "#166534"
                                        : p.counselingRounds.finalPhase >= 50
                                          ? "#854d0e"
                                          : "#991b1b",
                                  }}
                                >
                                  {p.counselingRounds.finalPhase}%
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.section>
        )}
      </AnimatePresence>

      {/* ─── EMPTY STATE (before predictions) ─── */}
      {!result && !loading && (
        <section
          style={{
            maxWidth: "1200px",
            margin: "40px auto 0",
            padding: "0 24px 64px",
          }}
        >
          {/* Features */}
          <div style={{ textAlign: "center", marginBottom: "40px" }}>
            <h2 className="section-title">Why Use Our Predictor?</h2>
            <p className="section-subtitle">
              Powered by data science and real AP EAPCET cutoff data
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {[
              {
                icon: <Brain size={28} />,
                color: "#3b82f6",
                bg: "#eff6ff",
                title: "AI-Powered Scoring",
                desc: "Multi-factor scoring engine analyzing rank similarity, fee compatibility, location, and branch popularity",
              },
              {
                icon: <BarChart3 size={28} />,
                color: "#8b5cf6",
                bg: "#f5f3ff",
                title: "Data-Driven Analytics",
                desc: "Interactive charts and visualizations showing cutoff trends, fee distribution, and competition analysis",
              },
              {
                icon: <CalendarDays size={28} />,
                color: "#10b981",
                bg: "#f0fdf4",
                title: "Counseling Simulator",
                desc: "Simulate Round 1, Round 2, and Final Phase outcomes to plan your counseling strategy",
              },
              {
                icon: <Sparkles size={28} />,
                color: "#f59e0b",
                bg: "#fffbeb",
                title: "Personalized Insights",
                desc: "AI-generated explanations for each college prediction with detailed score breakdowns",
              },
              {
                icon: <Shield size={28} />,
                color: "#f43f5e",
                bg: "#fff1f2",
                title: "Real Cutoff Data",
                desc: "Built on official 2024 AP EAPCET cutoff data from 271+ colleges across 13 districts",
              },
              {
                icon: <Zap size={28} />,
                color: "#06b6d4",
                bg: "#ecfeff",
                title: "Instant Results",
                desc: "No OTP, no login required. Get instant predictions with 3-tier probability classification",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "16px",
                    background: feature.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: feature.color,
                    marginBottom: "16px",
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 700,
                    color: "#0f172a",
                    margin: "0 0 8px",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#64748b",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ─── FOOTER ─── */}
      <footer
        style={{
          background: "#0f172a",
          padding: "48px 24px 32px",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: "13px",
          borderTop: "1px solid #1e293b",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          {/* Creator Promotion Section */}
          <div style={{
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
            border: "1px solid rgba(59, 130, 246, 0.2)",
            borderRadius: "16px",
            padding: "32px",
            marginBottom: "40px",
            display: "inline-block",
            maxWidth: "650px",
            width: "100%",
            boxShadow: "0 10px 30px -10px rgba(0,0,0,0.5)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px", justifyContent: "center", flexWrap: "wrap" }}>
              <img src="/profile.png" alt="Jeevan Kumar Guduru" style={{ width: "72px", height: "72px", borderRadius: "50%", border: "3px solid #60a5fa", objectFit: "cover", boxShadow: "0 4px 12px rgba(96, 165, 250, 0.4)" }} onError={(e) => { e.target.onerror = null; e.target.src = "https://ui-avatars.com/api/?name=Jeevan+Kumar&background=2563eb&color=fff&size=128" }} />
              <div style={{ textAlign: "left" }}>
                <h3 style={{ color: "white", fontSize: "20px", fontWeight: "800", margin: "0 0 4px" }}>
                  Did this tool help you? 🚀
                </h3>
                <span style={{ color: "#60a5fa", fontSize: "14px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em" }}>Jeevan Kumar Guduru</span>
              </div>
            </div>
            <p style={{ color: "#cbd5e1", fontSize: "15px", marginBottom: "24px", lineHeight: "1.6" }}>
              I'm an educational content creator dedicated to helping students like you make the best career choices. Follow my socials for more insights, counseling tips, and updates!
            </p>
            
            <div className="social-grid">
              <a href="https://www.instagram.com/jeevankumarguduru_official?igsh=dHRhbjBwZHdkNmRx&utm_source=qr" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "10px", color: "white", textDecoration: "none", transition: "all 0.2s", fontWeight: "500" }} onMouseOver={e => {e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.transform="translateY(-2px)"}} onMouseOut={e => {e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.transform="none"}}>
                <InstagramIcon size={18} color="#e1306c" /> Instagram
              </a>
              <a href="https://www.youtube.com/@JeevanKumarGuduru" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "10px", color: "white", textDecoration: "none", transition: "all 0.2s", fontWeight: "500" }} onMouseOver={e => {e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.transform="translateY(-2px)"}} onMouseOut={e => {e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.transform="none"}}>
                <YoutubeIcon size={18} color="#ff0000" /> YouTube
              </a>
              <a href="https://www.linkedin.com/in/gudurujeevankumar/" target="_blank" rel="noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "10px", color: "white", textDecoration: "none", transition: "all 0.2s", fontWeight: "500" }} onMouseOver={e => {e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.transform="translateY(-2px)"}} onMouseOut={e => {e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.transform="none"}}>
                <LinkedinIcon size={18} color="#0077b5" /> LinkedIn
              </a>
              <a href="mailto:jeevankumarguduru3@gmail.com" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "10px", color: "white", textDecoration: "none", transition: "all 0.2s", fontWeight: "500" }} onMouseOver={e => {e.currentTarget.style.background="rgba(255,255,255,0.1)"; e.currentTarget.style.transform="translateY(-2px)"}} onMouseOut={e => {e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.transform="none"}}>
                <Mail size={18} color="#ea4335" /> Email
              </a>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            <GraduationCap size={20} color="#60a5fa" />
            <span style={{ fontWeight: 700, color: "white", fontSize: "16px" }}>
              AP EAPCET College Predictor 2025
            </span>
          </div>
          <p style={{ margin: 0, marginBottom: "8px" }}>
            Built with real 2024 cutoff data • 271 Colleges • 69 Branches • 13 Districts
          </p>
          <p style={{ margin: 0, fontSize: "12px", color: "#64748b", maxWidth: "600px", marginLeft: "auto", marginRight: "auto" }}>
            Disclaimer: Predictions are based on historical data and algorithms.
            Actual admissions may vary based on counseling dynamics.
          </p>
        </div>
      </footer>
      
      {/* ─── FLOATING AI BOT ─── */}
      <AnimatePresence>
        {isBotVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "12px"
            }}
          >
            {/* Chat Bubble */}
            <div style={{
              background: "white",
              padding: "12px",
              borderRadius: "12px 12px 4px 12px",
              boxShadow: "0 10px 25px -5px rgba(0,0,0,0.2), 0 8px 10px -6px rgba(0,0,0,0.1)",
              border: "1px solid #e2e8f0",
              maxWidth: "220px",
              marginBottom: "4px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <span style={{ fontWeight: 800, fontSize: "13px", color: "#0f172a", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Sparkles size={12} color="#3b82f6" /> AI Assistant
                </span>
                <button onClick={() => setIsBotVisible(false)} style={{ background: "transparent", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}>
                  <X size={14} />
                </button>
              </div>
              <p style={{ fontSize: "12px", color: "#475569", margin: "0 0 10px", lineHeight: "1.4" }}>
                Did this help? Please support Jeevan by following his socials!
              </p>
              <div style={{ display: "flex", gap: "6px" }}>
                <a href="https://www.instagram.com/jeevankumarguduru_official?igsh=dHRhbjBwZHdkNmRx&utm_source=qr" target="_blank" rel="noreferrer" style={{ background: "#e1306c", color: "white", width: "32px", height: "32px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform="scale(1.1)"} onMouseOut={e => e.currentTarget.style.transform="scale(1)"}><InstagramIcon size={14} /></a>
                <a href="https://www.youtube.com/@JeevanKumarGuduru" target="_blank" rel="noreferrer" style={{ background: "#ff0000", color: "white", width: "32px", height: "32px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform="scale(1.1)"} onMouseOut={e => e.currentTarget.style.transform="scale(1)"}><YoutubeIcon size={14} /></a>
                <a href="https://www.linkedin.com/in/gudurujeevankumar/" target="_blank" rel="noreferrer" style={{ background: "#0077b5", color: "white", width: "32px", height: "32px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", transition: "transform 0.2s" }} onMouseOver={e => e.currentTarget.style.transform="scale(1.1)"} onMouseOut={e => e.currentTarget.style.transform="scale(1)"}><LinkedinIcon size={14} /></a>
              </div>
            </div>
            
            {/* Bot Avatar */}
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
              cursor: "pointer",
              border: "2px solid white",
              transition: "transform 0.2s"
            }} 
            onClick={() => setIsBotVisible(!isBotVisible)}
            onMouseOver={e => e.currentTarget.style.transform="scale(1.05)"} 
            onMouseOut={e => e.currentTarget.style.transform="scale(1)"}>
              <span style={{ fontSize: "24px" }}>🤖</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* ─── FLOATING AI BOT (Closed State) ─── */}
      <AnimatePresence>
        {!isBotVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            style={{
              position: "fixed",
              bottom: "24px",
              right: "24px",
              zIndex: 50,
            }}
          >
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #2563eb, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
              cursor: "pointer",
              border: "2px solid white",
              transition: "transform 0.2s"
            }} 
            onClick={() => setIsBotVisible(true)}
            onMouseOver={e => e.currentTarget.style.transform="scale(1.1)"} 
            onMouseOut={e => e.currentTarget.style.transform="scale(1)"}>
              <span style={{ fontSize: "24px" }}>🤖</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
    </main>
  );
}
