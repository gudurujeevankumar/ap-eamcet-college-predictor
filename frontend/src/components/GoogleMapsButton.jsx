import React from "react";
import { MapPin } from "lucide-react";

export default function GoogleMapsButton({ collegeName, place, districtFull, instCode, branchName }) {
  const query = encodeURIComponent(`${collegeName} ${place} ${districtFull} Andhra Pradesh`);
  const url = `https://www.google.com/maps/search/?api=1&query=${query}`;

  const handleClick = () => {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "google_maps_click", {
        college_code: instCode,
        college_name: collegeName,
        district: districtFull,
        course: branchName,
      });
    }
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Open ${collegeName} in Google Maps`}
      className="cc-maps-btn"
      onClick={handleClick}
    >
      <MapPin size={14} /> 
      <span className="maps-text-desktop">View on Google Maps</span>
      <span className="maps-text-tablet">View Maps</span>
      <span className="maps-text-mobile">Open in Google Maps</span>
    </a>
  );
}
