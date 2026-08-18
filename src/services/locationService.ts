export interface LocationSuggestion {
  description: string;
  mainText: string;
  secondaryText: string;
}

// Fallback lists of popular locations in India for resilient autocomplete
const LOCAL_CITIES = [
  "Indore", "Bhopal", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata",
  "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Visakhapatnam", "Thane", "Thiruvananthapuram",
  "Bhubaneswar", "Patna", "Ranchi", "Guwahati", "Raipur", "Chandigarh", "Shimla", "Dehradun", "Srinagar", "Jammu"
];

const LOCAL_STATES = [
  "Madhya Pradesh", "Maharashtra", "Delhi", "Karnataka", "Telangana", "Gujarat", "Tamil Nadu",
  "West Bengal", "Rajasthan", "Uttar Pradesh", "Andhra Pradesh", "Kerala", "Punjab", "Haryana",
  "Bihar", "Jharkhand", "Odisha", "Chhattisgarh", "Assam", "Himachal Pradesh", "Uttarakhand", "Jammu and Kashmir"
];

const LOCAL_PINCODES = [
  "452001", "452002", "452003", "452010", "462001", "462002", "462003", "462022", "400001", "110001", 
  "560001", "500001", "380001", "600001", "700001"
];

/**
 * Fetches location suggestions from the Google Places Autocomplete service.
 * Refers to types:
 * - '(cities)' for City suggestions
 * - '(regions)' for State/Region suggestions
 * - 'postal_code' for Pincode suggestions
 *
 * Falls back immediately to local Indian location suggestions if the script fails to load or API queries fail.
 * Uses gm_authFailure detection and a 400ms timeout for instant responsiveness.
 *
 * @param input The text input to autocomplete
 * @param types Google Places Autocomplete types restriction
 * @returns A Promise resolving to an array of LocationSuggestions
 */
export const getGooglePlaceSuggestions = (
  input: string,
  types: string
): Promise<LocationSuggestion[]> => {
  const getLocalFallback = () => {
    const query = input.toLowerCase();
    let fallbackList: string[] = [];
    if (types === "(cities)") {
      fallbackList = LOCAL_CITIES;
    } else if (types === "(regions)") {
      fallbackList = LOCAL_STATES;
    } else if (types === "postal_code") {
      fallbackList = LOCAL_PINCODES;
    }

    return fallbackList
      .filter((item) => item.toLowerCase().includes(query))
      .slice(0, 5)
      .map((item) => ({
        description: `${item}, India`,
        mainText: item,
        secondaryText: "India",
      }));
  };

  return new Promise((resolve) => {
    if (!input || input.trim().length === 0) {
      resolve([]);
      return;
    }

    const win = window as any;

    // If Google Maps authentication has already failed globally, bypass Google queries instantly
    if (win.googleMapsAuthFailed) {
      resolve(getLocalFallback());
      return;
    }

    // Set a short 400ms timeout to prevent lagging if Google SDK hangs on query or fails silently
    const timeoutId = setTimeout(() => {
      resolve(getLocalFallback());
    }, 400);

    const safeResolve = (data: LocationSuggestion[]) => {
      clearTimeout(timeoutId);
      resolve(data);
    };

    // Check if Google Maps Places SDK has loaded globally via index.html
    if (win.google?.maps?.places) {
      try {
        const service = new win.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input,
            types: [types],
            componentRestrictions: { country: "in" }, // Restrict results to India
          },
          (predictions: any[], status: any) => {
            if (
              status === win.google.maps.places.PlacesServiceStatus.OK &&
              predictions &&
              predictions.length > 0
            ) {
              const suggestions = predictions.map((pred) => ({
                description: pred.description,
                mainText: pred.structured_formatting?.main_text || "",
                secondaryText: pred.structured_formatting?.secondary_text || "",
              }));
              safeResolve(suggestions);
            } else {
              // API status is not OK or empty results, resolve with local fallbacks
              safeResolve(getLocalFallback());
            }
          }
        );
      } catch (error) {
        console.error("Error using Google Autocomplete Service:", error);
        safeResolve(getLocalFallback());
      }
    } else {
      // SDK has not loaded yet (or has failed), fallback instantly
      safeResolve(getLocalFallback());
    }
  });
};
