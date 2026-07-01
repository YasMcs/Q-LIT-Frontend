"use client";

import React, { useState, useEffect, useRef } from "react";

const CustomTimePicker = ({ value, onChange, id, className, onKeyDown }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial 24h value to 12h representation
  const parseTime = (val) => {
    if (!val) return { hour: 12, minute: 0, period: "PM" };
    const [h, m] = val.split(":").map(Number);
    const period = h >= 12 ? "PM" : "AM";
    let hour = h % 12;
    if (hour === 0) hour = 12;
    return { hour, minute: m, period };
  };

  const [time, setTime] = useState(parseTime(value));

  // Sync internal state if prop value changes externally
  useEffect(() => {
    setTime(parseTime(value));
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleApply = (newTime) => {
    setTime(newTime);
    let h24 = newTime.hour;
    if (newTime.period === "AM" && h24 === 12) h24 = 0;
    if (newTime.period === "PM" && h24 < 12) h24 += 12;
    
    const formattedHour = String(h24).padStart(2, "0");
    const formattedMinute = String(newTime.minute).padStart(2, "0");
    onChange({ target: { value: `${formattedHour}:${formattedMinute}` } });
  };

  const displayTime = () => {
    if (!value) return "Hora";
    const formattedHour = String(time.hour).padStart(2, "0");
    const formattedMinute = String(time.minute).padStart(2, "0");
    return `${formattedHour}:${formattedMinute} ${time.period}`;
  };

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);
  const periods = ["AM", "PM"];

  return (
    <div className={`relative outline-none ${className}`} ref={containerRef} id={id} tabIndex={0} onKeyDown={onKeyDown}>
      <div 
        className="w-full h-full flex items-center cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        {displayTime()}
      </div>

      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] right-0 bg-[var(--bg-panel)] border border-[var(--border-color)] rounded-lg shadow-xl z-[100] p-3 flex gap-2" style={{ width: "240px" }}>
          {/* Hours Column */}
          <div className="flex-1 max-h-48 overflow-y-auto custom-time-col">
            {hours.map((h) => (
              <div 
                key={h} 
                className={`py-2 text-center cursor-pointer rounded text-sm ${time.hour === h ? 'bg-[#6767ea] text-white font-bold' : 'hover:bg-white/10 text-[var(--text-primary)]'}`}
                onClick={() => handleApply({ ...time, hour: h })}
              >
                {String(h).padStart(2, "0")}
              </div>
            ))}
          </div>
          
          {/* Minutes Column */}
          <div className="flex-1 max-h-48 overflow-y-auto custom-time-col border-x border-[var(--border-color)] px-1">
            {minutes.map((m) => (
              <div 
                key={m} 
                className={`py-2 text-center cursor-pointer rounded text-sm ${time.minute === m ? 'bg-[#6767ea] text-white font-bold' : 'hover:bg-white/10 text-[var(--text-primary)]'}`}
                onClick={() => handleApply({ ...time, minute: m })}
              >
                {String(m).padStart(2, "0")}
              </div>
            ))}
          </div>

          {/* AM/PM Column */}
          <div className="flex-1 max-h-48 overflow-y-auto custom-time-col">
            {periods.map((p) => (
              <div 
                key={p} 
                className={`py-2 text-center cursor-pointer rounded text-sm ${time.period === p ? 'bg-[#6767ea] text-white font-bold' : 'hover:bg-white/10 text-[var(--text-primary)]'}`}
                onClick={() => handleApply({ ...time, period: p })}
              >
                {p}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomTimePicker;
