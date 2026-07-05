import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    q: "How are predictions generated?",
    a: "Predictions are generated using a machine learning algorithm that analyzes official APSCHE historical counselling cutoffs, current seat matrices, and applicant competition levels to estimate your admission probability."
  },
  {
    q: "Are these official APSCHE results?",
    a: "No. These are estimated predictions meant for guidance purposes only. Official seat allotments will be done exclusively by APSCHE during the actual counselling process."
  },
  {
    q: "Why do cutoffs change every year?",
    a: "Cutoffs fluctuate based on paper difficulty, the total number of students appearing for the exam, shifts in student preferences for specific branches (like CSE/IT), and changes in the total available seats."
  },
  {
    q: "Can I trust these predictions?",
    a: "Our predictions are highly accurate as they rely on official verified historical data. However, they are probabilistic estimates. We strongly recommend using them to build your preference list rather than as a guarantee of admission."
  },
  {
    q: "What does Best Fit mean?",
    a: "A 'Best Fit' badge indicates that your rank is significantly better than the historical cutoff for that college and branch, meaning you have a near-certain chance of securing a seat there."
  },
  {
    q: "How does Google Maps work?",
    a: "Clicking the 'View on Google Maps' button automatically searches the exact college name and location, allowing you to check commute times, campus surroundings, and nearby hostels instantly."
  },
  {
    q: "Can I download the report as PDF?",
    a: "Yes! Once your predictions are generated, you can click the 'Download PDF Report' button at the top of the results section to save an offline copy of your personalized college list."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section style={{ maxWidth: "800px", margin: "0 auto 48px", padding: "0 24px" }}>
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2 style={{ fontSize: "clamp(24px, 4vw, 32px)", fontWeight: 800, color: "#0f172a", margin: "0 0 16px" }}>
          Frequently Asked Questions
        </h2>
        <p style={{ fontSize: "16px", color: "#64748b", margin: 0 }}>
          Everything you need to know about how the predictor works.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {faqs.map((faq, i) => (
          <div 
            key={i} 
            style={{ 
              background: "#ffffff", 
              borderRadius: "16px", 
              border: "1px solid #f1f5f9",
              overflow: "hidden",
              boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{
                width: "100%",
                padding: "16px 20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                color: "#0f172a",
                fontSize: "15px",
                fontWeight: 600
              }}
            >
              {faq.q}
              <motion.div
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <ChevronDown size={20} color="#64748b" />
              </motion.div>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div style={{ padding: "0 20px 16px", color: "#64748b", fontSize: "14px", lineHeight: 1.6 }}>
                    {faq.a}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
