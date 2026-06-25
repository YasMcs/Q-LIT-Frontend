"use client";
import React, { useState, useRef, useEffect } from "react";

export default function CustomSelect({ options, value, onChange, icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-3 w-full min-w-[200px] px-4 py-3 bg-panel border ${
          isOpen ? "border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue)]/20" : "border-border"
        } rounded-xl shadow-sm hover:border-[var(--accent-blue)] transition-all text-sm text-foreground font-medium`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <i className={`fa-solid ${icon} text-muted shrink-0`} />}
          <span className="truncate">{selectedOption?.label}</span>
        </div>
        <i className={`fa-solid fa-chevron-down shrink-0 text-muted text-xs transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-panel border border-border rounded-xl shadow-lg py-1 overflow-hidden animate-fade-in">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                opt.value === value 
                  ? "bg-input text-accent font-semibold" 
                  : "text-foreground hover:bg-[var(--bg-main)]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
