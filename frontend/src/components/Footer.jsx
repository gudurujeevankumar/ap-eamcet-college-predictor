import React from 'react';
import { Briefcase, Globe, Mail } from 'lucide-react';

const Github = ({ size = 18, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
  </svg>
);

const Linkedin = ({ size = 18, color = "currentColor" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer style={{ background: "#0f172a", color: "#e2e8f0", paddingTop: "32px", paddingBottom: "24px", marginTop: "0" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 24px" }}>
        
        {/* Disclaimer Section */}
        <div style={{ 
          background: "rgba(255, 255, 255, 0.03)", 
          border: "1px solid rgba(255, 255, 255, 0.1)", 
          borderRadius: "16px", 
          padding: "24px 32px",
          marginBottom: "48px"
        }}>
          <h4 style={{ fontSize: "16px", fontWeight: 700, color: "#f8fafc", margin: "0 0 12px" }}>
            Important Disclaimer
          </h4>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>
            Predictions are generated using historical counselling cutoff data and intelligent prediction algorithms. 
            They are intended for guidance purposes only. Actual seat allotments depend entirely on the official 
            APSCHE counselling process for the current academic year.
          </p>
        </div>

        {/* Footer Links & Info */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "32px", marginBottom: "48px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc", margin: "0 0 16px" }}>
              College Predictor
            </h3>
            <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: 1.6, margin: "0 0 24px" }}>
              Empowering students to make data-driven admission decisions with confidence.
            </p>
            <div style={{ display: "flex", gap: "16px" }}>
              <a href="https://github.com/jeevankumarguduru" target="_blank" rel="noreferrer" style={{ color: "#94a3b8", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#94a3b8"} aria-label="GitHub">
                <Github size={20} />
              </a>
              <a href="https://www.linkedin.com/in/gudurujeevankumar/" target="_blank" rel="noreferrer" style={{ color: "#94a3b8", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#94a3b8"} aria-label="LinkedIn">
                <Linkedin size={20} />
              </a>
              <a href="https://jeevankumar.co.in" target="_blank" rel="noreferrer" style={{ color: "#94a3b8", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#94a3b8"} aria-label="Portfolio">
                <Globe size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#f8fafc", margin: "0 0 16px" }}>Company</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><a href="#" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#94a3b8"}>About</a></li>
              <li><a href="#" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#94a3b8"}>Portfolio</a></li>
              <li><a href="#" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#94a3b8"}>Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 style={{ fontSize: "15px", fontWeight: 600, color: "#f8fafc", margin: "0 0 16px" }}>Legal</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><a href="#" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#94a3b8"}>Privacy Policy</a></li>
              <li><a href="#" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#94a3b8"}>Terms of Service</a></li>
              <li><a href="#" style={{ color: "#94a3b8", textDecoration: "none", fontSize: "14px", transition: "color 0.2s" }} onMouseOver={e => e.currentTarget.style.color = "#fff"} onMouseOut={e => e.currentTarget.style.color = "#94a3b8"}>Data Source</a></li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div style={{ 
          borderTop: "1px solid rgba(255, 255, 255, 0.1)", 
          paddingTop: "24px", 
          display: "flex", 
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px"
        }}>
          <div style={{ fontSize: "14px", color: "#64748b" }}>
            &copy; {currentYear} Jeevan Kumar Guduru. All rights reserved.
          </div>
          <div style={{ fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
            Version 2.0.0 (Production)
          </div>
        </div>
      </div>
    </footer>
  );
}
