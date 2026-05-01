import React, { useState, useRef } from 'react';

const LocationAutocomplete = ({ value, onChange, onSelect, placeholder, className }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef(null);

  const search = async (query) => {
    if (!query || query.length < 3) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`);
      const data = await res.json();
      setSuggestions(data);
      setShow(true);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    onChange(val);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => search(val), 800);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => { if (suggestions.length > 0) setShow(true); }}
          onBlur={() => setTimeout(() => setShow(false), 200)}
          placeholder={placeholder}
          className={className || "w-full bg-[#f4f4f4] border-0 border-b border-gray-300 p-2.5 text-[12px] text-black focus:outline-none focus:border-[#24a148] focus:ring-0"}
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-[#24a148] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </div>
      {show && suggestions.length > 0 && (
        <div className="absolute z-[2000] w-full bg-white border border-[#e0e0e0] shadow-xl mt-1 max-h-[300px] overflow-y-auto">
          {suggestions.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSelect({
                  address: s.display_name,
                  coords: { lat: parseFloat(s.lat), lng: parseFloat(s.lon) }
                });
                setShow(false);
              }}
              className="w-full text-left p-3 hover:bg-green-50 border-b border-[#f4f4f4] transition-colors"
            >
              <p className="text-xs font-bold text-[#161616] truncate">{s.display_name.split(',')[0]}</p>
              <p className="text-[10px] text-[#525252] truncate">{s.display_name}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;
