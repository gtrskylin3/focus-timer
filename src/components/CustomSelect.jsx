
import React, { useState, useRef, useEffect } from 'react';

function CustomSelect({ options, onSelect, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState('');
  const selectRef = useRef(null);

  const handleSelect = (value, label) => {
    setSelectedValue(label);
    onSelect(value);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const placeholderOption = { value: '', label: placeholder };
  const allOptions = [placeholderOption, ...options];

  return (
    <div className="custom-select-container" ref={selectRef}>
      <div
        className="custom-select-selected"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedValue || placeholder}
      </div>
      {isOpen && (
        <div className="custom-select-options">
          {allOptions.map((option) => (
            <div
              key={option.value}
              className="custom-select-option"
              onClick={() => handleSelect(option.value, option.label)}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CustomSelect;
