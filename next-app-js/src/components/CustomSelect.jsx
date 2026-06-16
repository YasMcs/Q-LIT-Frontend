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
        className={`flex items-center justify-between gap-3 w-full min-w-[200px] px-4 py-3 bg-white border ${
          isOpen ? "border-indigo-500 ring-2 ring-indigo-100" : "border-slate-200"
        } rounded-xl shadow-sm hover:border-indigo-400 transition-all text-sm text-slate-700 font-medium`}
      >
        <div className="flex items-center gap-2 truncate">
          {icon && <i className={`fa-solid ${icon} text-slate-400 shrink-0`} />}
          <span className="truncate">{selectedOption?.label}</span>
        </div>
        <i className={`fa-solid fa-chevron-down shrink-0 text-slate-400 text-xs transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-xl shadow-lg py-1 overflow-hidden animate-fade-in">
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
                  ? "bg-indigo-50 text-indigo-700 font-semibold" 
                  : "text-slate-600 hover:bg-slate-50"
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
