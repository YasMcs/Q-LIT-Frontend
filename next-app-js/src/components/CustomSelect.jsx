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
        className={`flex items-center justify-between gap-3 w-full min-w-[200px] px-4 py-3 bg-[var(--bg-panel)] border ${
          isOpen ? "border-[var(--accent-blue)] ring-2 ring-[var(--accent-blue)]/20" : "border-[var(--border-color)]"
        } rounded-xl shadow-sm hover:border-[var(--accent-blue)] transition-all text-sm text-[var(--text-primary)] font-medium`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <i className={`fa-solid ${icon} text-[var(--text-muted)] shrink-0`} />}
          <span className="truncate">{selectedOption?.label}</span>
        </div>
        <i className={`fa-solid fa-chevron-down shrink-0 text-[var(--text-muted)] text-xs transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-xl shadow-lg py-1 overflow-hidden animate-fade-in">
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
                  ? "bg-[var(--bg-input)] text-[var(--accent-blue)] font-semibold" 
                  : "text-[var(--text-primary)] hover:bg-[var(--bg-main)]"
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
