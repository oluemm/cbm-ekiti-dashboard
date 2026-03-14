import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X } from 'lucide-react';
import { clsx } from 'clsx';

interface MultiSelectDropdownProps {
  label: string;
  placeholder?: string;
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
  clearable?: boolean;
}

export default function MultiSelectDropdown({
  label,
  placeholder = 'Select options...',
  options,
  selected,
  onChange,
  disabled = false,
  clearable = true,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleToggleOption = (option: string) => {
    const newSelected = selected.includes(option)
      ? selected.filter((s) => s !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full" ref={containerRef}>
      <label className="mb-1.5 block text-xs font-semibold uppercase text-gray-500">
        {label}
      </label>

      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={clsx(
            'w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-sm',
            'flex items-center justify-between gap-2 transition-colors',
            'focus:outline-none focus:ring-2 focus:ring-primary-500',
            disabled ? 'bg-gray-50 cursor-not-allowed text-gray-400' : 'hover:border-gray-300 bg-white'
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {selected.length === 0 ? (
              <span className="text-gray-400">{placeholder}</span>
            ) : (
              <div className="flex flex-wrap gap-1 flex-1">
                {selected.slice(0, 2).map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-1 rounded bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700"
                  >
                    {item}
                  </span>
                ))}
                {selected.length > 2 && (
                  <span className="inline-flex items-center rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                    +{selected.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {selected.length > 0 && clearable && (
              <button
                onClick={handleClear}
                className="p-0.5 hover:bg-gray-100 rounded"
                type="button"
              >
                <X size={16} className="text-gray-400" />
              </button>
            )}
            <ChevronDown
              size={16}
              className={clsx(
                'text-gray-400 transition-transform',
                isOpen && 'rotate-180'
              )}
            />
          </div>
        </button>

        {isOpen && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg"
          >
            {/* Search Input */}
            <div className="sticky top-0 border-b border-gray-100 bg-white p-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded border border-gray-200 px-2.5 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {/* Options List */}
            <div className="max-h-48 overflow-y-auto">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-gray-400">
                  No options found
                </div>
              ) : (
                <div className="space-y-0">
                  {filteredOptions.map((option) => (
                    <label
                      key={option}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selected.includes(option)}
                        onChange={() => handleToggleOption(option)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="flex-1">{option}</span>
                      {selected.includes(option) && (
                        <span className="text-primary-600 text-xs font-medium">✓</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with info */}
            {selected.length > 0 && (
              <div className="border-t border-gray-100 bg-gray-50 px-3 py-2 text-xs text-gray-500">
                {selected.length} selected
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
