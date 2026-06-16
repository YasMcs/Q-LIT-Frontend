"use client";
import React from "react";

export default function StatBox({ label, value }) {
  return (
    <div className="feed-stat-box">
      <small>{label}</small>
      <h2>{value}</h2>
    </div>
  );
}
