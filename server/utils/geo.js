import Vendor from '../models/Vendor.js';

// Pre-mapped coordinate cache for major Indian cities to ensure fast, zero-latency matching
const KNOWN_CITY_COORDINATES = {
  'indore': { latitude: 22.7196, longitude: 75.8577 },
  'bhopal': { latitude: 23.2599, longitude: 77.4126 },
  'mumbai': { latitude: 19.0760, longitude: 72.8777 },
  'delhi': { latitude: 28.6139, longitude: 77.2090 },
  'new delhi': { latitude: 28.6139, longitude: 77.2090 },
  'bangalore': { latitude: 12.9716, longitude: 77.5946 },
  'bengaluru': { latitude: 12.9716, longitude: 77.5946 },
  'hyderabad': { latitude: 17.3850, longitude: 78.4867 },
  'ahmedabad': { latitude: 23.0225, longitude: 72.5714 },
  'chennai': { latitude: 13.0827, longitude: 80.2707 },
  'kolkata': { latitude: 22.5726, longitude: 88.3639 },
  'surat': { latitude: 21.1702, longitude: 72.8311 },
  'pune': { latitude: 18.5204, longitude: 73.8567 },
  'jaipur': { latitude: 26.9124, longitude: 75.7873 },
  'lucknow': { latitude: 26.8467, longitude: 80.9462 },
  'kanpur': { latitude: 26.4499, longitude: 80.3319 },
  'nagpur': { latitude: 21.1458, longitude: 79.0882 },
  'visakhapatnam': { latitude: 17.6868, longitude: 83.2185 },
  'thane': { latitude: 19.2183, longitude: 72.9781 },
  'patna': { latitude: 25.5941, longitude: 85.1376 },
  'vadodara': { latitude: 22.3072, longitude: 73.1812 },
  'ghaziabad': { latitude: 28.6692, longitude: 77.4538 },
  'ludhiana': { latitude: 30.9010, longitude: 75.8573 },
  'agra': { latitude: 27.1767, longitude: 78.0081 },
  'nashik': { latitude: 19.9975, longitude: 73.7898 },
  'faridabad': { latitude: 28.4089, longitude: 77.3178 },
  'meerut': { latitude: 28.9845, longitude: 77.7064 },
  'rajkot': { latitude: 22.3039, longitude: 70.8022 },
  'varanasi': { latitude: 25.3176, longitude: 82.9739 },
  'srinagar': { latitude: 34.0837, longitude: 74.7973 },
  'aurangabad': { latitude: 19.8762, longitude: 75.3433 },
  'amritsar': { latitude: 31.6340, longitude: 74.8723 },
  'navi mumbai': { latitude: 19.0330, longitude: 73.0297 },
  'allahabad': { latitude: 25.4358, longitude: 81.8463 },
  'prayagraj': { latitude: 25.4358, longitude: 81.8463 },
  'ranchi': { latitude: 23.3441, longitude: 85.3096 },
  'chandigarh': { latitude: 30.7333, longitude: 76.7794 },
  'coimbatore': { latitude: 11.0168, longitude: 76.9558 },
  'gwalior': { latitude: 26.2183, longitude: 78.1828 },
  'jabalpur': { latitude: 23.1815, longitude: 79.9864 },
  'ujjain': { latitude: 23.1765, longitude: 75.7885 },
  'dehradun': { latitude: 30.3165, longitude: 78.0322 },
  'gurgaon': { latitude: 28.4595, longitude: 77.0266 },
  'gurugram': { latitude: 28.4595, longitude: 77.0266 },
  'noida': { latitude: 28.5355, longitude: 77.3910 }
};

/**
 * Calculates Haversine distance in kilometers between two GPS points
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (
    lat1 === undefined || lon1 === undefined ||
    lat2 === undefined || lon2 === undefined ||
    lat1 === null || lon1 === null ||
    lat2 === null || lon2 === null ||
    (lat1 === 0 && lon1 === 0) ||
    (lat2 === 0 && lon2 === 0)
  ) {
    return Infinity;
  }

  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100; // Return rounded to 2 decimals
};

/**
 * Attempts to resolve coordinates for an address/city/pincode
 */
export const geocodeAddress = async ({ address, city, state, pincode }) => {
  // 1. Check known cities map first
  if (city) {
    const cleanCity = city.trim().toLowerCase();
    if (KNOWN_CITY_COORDINATES[cleanCity]) {
      return KNOWN_CITY_COORDINATES[cleanCity];
    }
  }

  // 2. Try OpenStreetMap Nominatim geocoding
  try {
    const queryParts = [address, city, state, pincode, 'India'].filter(Boolean);
    const query = encodeURIComponent(queryParts.join(', '));

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'PRLT-Healthcare-App/1.0',
          'Accept-Language': 'en'
        },
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon)
        };
      }
    }
  } catch (err) {
    // Silent fail for network/timeout to prevent blocking booking flow
  }

  // 3. Fallback check for city substring in address
  if (address) {
    const cleanAddress = address.toLowerCase();
    for (const [cityName, coords] of Object.entries(KNOWN_CITY_COORDINATES)) {
      if (cleanAddress.includes(cityName)) {
        return coords;
      }
    }
  }

  return null;
};

/**
 * Finds nearby vendors within a given radius (default 5 km)
 * @param {Object} options
 * @param {number} options.bookingLat - Booking destination latitude
 * @param {number} options.bookingLng - Booking destination longitude
 * @param {string} options.address - Destination address
 * @param {string} options.city - Destination city
 * @param {string} options.pincode - Destination pincode
 * @param {Array} options.serviceIds - Selected service ObjectIds
 * @param {string} options.staffPreference - Staff gender preference
 * @param {number} options.maxDistanceKm - Maximum radius in km (default: 5)
 */
export const findNearbyVendors = async ({
  bookingLat = 0,
  bookingLng = 0,
  address = '',
  city = '',
  pincode = '',
  serviceIds = [],
  staffPreference = 'Any Available',
  maxDistanceKm = 5
}) => {
  // Base query: Active, verified vendors providing the requested services
  const baseQuery = {
    isActive: true,
    verificationStatus: 'verified'
  };

  if (serviceIds && serviceIds.length > 0) {
    baseQuery.services = { $in: serviceIds };
  }

  if (staffPreference === 'Male Staff') {
    baseQuery.gender = 'Male';
  } else if (staffPreference === 'Female Staff') {
    baseQuery.gender = 'Female';
  }

  // Fetch candidate vendors
  const candidateVendors = await Vendor.find(baseQuery);

  if (candidateVendors.length === 0) {
    return [];
  }

  const validBookingCoords =
    typeof bookingLat === 'number' &&
    typeof bookingLng === 'number' &&
    !isNaN(bookingLat) &&
    !isNaN(bookingLng) &&
    (bookingLat !== 0 || bookingLng !== 0);

  if (validBookingCoords) {
    // 1. Calculate distance for all vendors with valid coordinates
    const vendorsWithDistance = [];
    const vendorsWithoutCoords = [];

    for (const vendor of candidateVendors) {
      const vLat = vendor.latitude;
      const vLng = vendor.longitude;

      if (
        typeof vLat === 'number' &&
        typeof vLng === 'number' &&
        !isNaN(vLat) &&
        !isNaN(vLng) &&
        (vLat !== 0 || vLng !== 0)
      ) {
        const dist = calculateDistanceKm(bookingLat, bookingLng, vLat, vLng);
        vendorsWithDistance.push({
          vendor,
          distanceKm: dist
        });
      } else {
        vendorsWithoutCoords.push(vendor);
      }
    }

    // Filter vendors within maxDistanceKm (5 km)
    const vendorsWithin5Km = vendorsWithDistance
      .filter(item => item.distanceKm <= maxDistanceKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (vendorsWithin5Km.length > 0) {
      return vendorsWithin5Km.map(item => {
        const vObj = item.vendor;
        vObj._doc = { ...vObj._doc, distanceKm: item.distanceKm };
        return vObj;
      });
    }

    // If no vendors within 5 km, expand search radius up to 10 km
    const vendorsWithin10Km = vendorsWithDistance
      .filter(item => item.distanceKm <= 10)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    if (vendorsWithin10Km.length > 0) {
      return vendorsWithin10Km.map(item => {
        const vObj = item.vendor;
        vObj._doc = { ...vObj._doc, distanceKm: item.distanceKm };
        return vObj;
      });
    }

    // If still no vendor within 10km, fallback to same city or pincode
    const fallbackVendors = candidateVendors.filter(v => {
      const matchPincode = pincode && (v.pincode === pincode || (v.serviceAreas && v.serviceAreas.includes(pincode)));
      const matchCity = city && v.city && v.city.toLowerCase() === city.toLowerCase();
      return matchPincode || matchCity;
    });

    if (fallbackVendors.length > 0) {
      return fallbackVendors;
    }

    // Return nearest vendors regardless of distance if candidate list exists
    if (vendorsWithDistance.length > 0) {
      const nearest = vendorsWithDistance.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 3);
      return nearest.map(item => {
        const vObj = item.vendor;
        vObj._doc = { ...vObj._doc, distanceKm: item.distanceKm };
        return vObj;
      });
    }
  }

  // If booking coordinates are unavailable, match by pincode, service areas, or city
  const matched = candidateVendors.filter(v => {
    const matchPincode = pincode && (v.pincode === pincode || (v.serviceAreas && v.serviceAreas.includes(pincode)));
    const matchCity = city && v.city && v.city.toLowerCase() === city.toLowerCase();
    const matchAddress = address && v.city && address.toLowerCase().includes(v.city.toLowerCase());
    return matchPincode || matchCity || matchAddress;
  });

  return matched.length > 0 ? matched : candidateVendors.slice(0, 5);
};
