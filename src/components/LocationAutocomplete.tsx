import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { useGooglePlaces } from '../hooks/useGooglePlaces';
import { MapPin } from 'lucide-react';

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  type?: '(regions)' | '(regions)' | 'postal_code' | '(cities)'; // Supports City, State, or Pincode queries
}

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = 'Search location...',
  className = '',
  error,
  type = '(cities)',
}: LocationAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoadingPredictions, setIsLoadingPredictions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isLoaded, getPlacePredictions } = useGooglePlaces();

  // Update input value when prop value changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);

    if (newValue.length > 1 && isLoaded) {
      setIsLoadingPredictions(true);
      getPlacePredictions(newValue, (results) => {
        setPredictions(results || []);
        setShowDropdown(true);
        setIsLoadingPredictions(false);
      }, type);
    } else {
      setPredictions([]);
      setShowDropdown(false);
    }
  };

  // Handle prediction selection - extracts the clean field value (e.g. City or State name)
  const handleSelectPrediction = (prediction: PlacePrediction) => {
    const selectedText = prediction.structured_formatting?.main_text || prediction.description;
    setInputValue(selectedText);
    onChange(selectedText);
    setShowDropdown(false);
    setPredictions([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={className}
          autoComplete="off"
          onFocus={() => {
            if (predictions.length > 0) {
              setShowDropdown(true);
            }
          }}
        />
        {!isLoaded && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {isLoadingPredictions ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-spin h-5 w-5 border-2 border-gray-300 border-t-gray-600 rounded-full mx-auto"></div>
            </div>
          ) : (
            predictions.map((prediction) => (
              <div
                key={prediction.place_id}
                onClick={() => handleSelectPrediction(prediction)}
                className="p-3 hover:bg-slate-100 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors text-left"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 text-sm truncate">
                      {prediction.structured_formatting?.main_text}
                    </div>
                    {prediction.structured_formatting?.secondary_text && (
                      <div className="text-xs text-gray-500 truncate">
                        {prediction.structured_formatting.secondary_text}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};
