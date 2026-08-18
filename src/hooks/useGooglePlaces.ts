import { useState, useEffect, useCallback } from 'react';

// Shared global states to avoid duplicate script injection and track status
let scriptLoaded = false;
let scriptLoading = false;
let authFailed = false;
const callbacks = new Set<() => void>();
const errorCallbacks = new Set<() => void>();

export const useGooglePlaces = () => {
  const [isLoaded, setIsLoaded] = useState(scriptLoaded);

  useEffect(() => {
    if (scriptLoaded) {
      setIsLoaded(true);
      return;
    }

    if (authFailed) {
      setIsLoaded(true); // Treat as loaded to permit falling back instantly
      return;
    }

    const handleLoad = () => {
      scriptLoaded = true;
      scriptLoading = false;
      setIsLoaded(true);
    };

    const handleError = () => {
      authFailed = true;
      scriptLoading = false;
      setIsLoaded(true); // Treat as loaded so predictions calls fallback instantly
    };

    callbacks.add(handleLoad);
    errorCallbacks.add(handleError);

    if (scriptLoading) {
      return () => {
        callbacks.delete(handleLoad);
        errorCallbacks.delete(handleError);
      };
    }

    const win = window as any;
    if (win.google?.maps?.places) {
      scriptLoaded = true;
      callbacks.forEach(cb => cb());
      callbacks.clear();
      setIsLoaded(true);
      return;
    }

    scriptLoading = true;

    // Define global Google auth failure callback to catch errors like ApiNotActivatedMapError instantly
    win.gm_authFailure = () => {
      authFailed = true;
      errorCallbacks.forEach(cb => cb());
      errorCallbacks.clear();
    };

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.warn("VITE_GOOGLE_MAPS_API_KEY is not defined.");
      handleError();
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-sdk-dynamic';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      callbacks.forEach(cb => cb());
      callbacks.clear();
    };

    script.onerror = () => {
      errorCallbacks.forEach(cb => cb());
      errorCallbacks.clear();
    };

    document.head.appendChild(script);

    return () => {
      callbacks.delete(handleLoad);
      errorCallbacks.delete(handleError);
    };
  }, []);

  const getPlacePredictions = useCallback(
    (input: string, callback: (predictions: any[] | null) => void, types: string = '(cities)') => {
      const win = window as any;

      const getLocalFallback = () => {
        const query = input.toLowerCase();
        let fallbackList: string[] = [];
        if (types === "(cities)") {
          fallbackList = [
            "Indore", "Bhopal", "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai", "Kolkata",
            "Surat", "Pune", "Jaipur", "Lucknow", "Kanpur", "Nagpur", "Visakhapatnam", "Thane", "Thiruvananthapuram",
            "Bhubaneswar", "Patna", "Ranchi", "Guwahati", "Raipur", "Chandigarh", "Shimla", "Dehradun", "Srinagar", "Jammu"
          ];
        } else if (types === "(regions)") {
          fallbackList = [
            "Madhya Pradesh", "Maharashtra", "Delhi", "Karnataka", "Telangana", "Gujarat", "Tamil Nadu",
            "West Bengal", "Rajasthan", "Uttar Pradesh", "Andhra Pradesh", "Kerala", "Punjab", "Haryana",
            "Bihar", "Jharkhand", "Odisha", "Chhattisgarh", "Assam", "Himachal Pradesh", "Uttarakhand", "Jammu and Kashmir"
          ];
        } else if (types === "postal_code") {
          fallbackList = [
            "452001", "452002", "452003", "452010", "462001", "462002", "462003", "462022", "400001", "110001", 
            "560001", "500001", "380001", "600001", "700001"
          ];
        }

        return fallbackList
          .filter((item) => item.toLowerCase().includes(query))
          .slice(0, 5)
          .map((item) => ({
            place_id: `fallback-${item}`,
            description: `${item}, India`,
            structured_formatting: {
              main_text: item,
              secondary_text: "India",
            },
          }));
      };

      if (authFailed || !win.google?.maps?.places) {
        callback(getLocalFallback());
        return;
      }

      // 400ms safety timeout to fallback immediately if Places API query hangs or is slow
      let hasResolved = false;
      const timeoutId = setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true;
          callback(getLocalFallback());
        }
      }, 400);

      try {
        const service = new win.google.maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input,
            types: [types],
            componentRestrictions: { country: 'in' },
          },
          (results: any[], status: any) => {
            if (hasResolved) return;
            hasResolved = true;
            clearTimeout(timeoutId);

            if (status === win.google.maps.places.PlacesServiceStatus.OK && results) {
              callback(results);
            } else {
              callback(getLocalFallback());
            }
          }
        );
      } catch (e) {
        if (!hasResolved) {
          hasResolved = true;
          clearTimeout(timeoutId);
          callback(getLocalFallback());
        }
      }
    },
    []
  );

  return { isLoaded, getPlacePredictions };
};
