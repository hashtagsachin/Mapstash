import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Fetches all pins from the backend API.
 * @returns {Promise<Array>} A promise that resolves to an array of PinDto objects.
 */
export const fetchPins = async () => {
  try {
    const response = await apiClient.get('/api/pins');
    return response.data;
  } catch (error) {
    console.error("Error fetching pins:", error);
    throw error;
  }
};

/**
 * Creates a new pin.
 * @param {object} pinData - Object matching CreatePinDto { title, notes, latitude, longitude, tags }.
 * @returns {Promise<object>} A promise that resolves to the created PinDto object.
 */
export const createPin = async (pinData) => { // <<< NEW
  try {
    const response = await apiClient.post('/api/pins', pinData);
    return response.data;
  } catch (error) {
    console.error("Error creating pin:", error);
    // Handle validation errors specifically if needed (e.g., check error.response.status === 400)
    throw error;
  }
};

/**
 * Updates an existing pin.
 * @param {number} id - The ID of the pin to update.
 * @param {object} pinData - Object matching UpdatePinDto { title, notes, tags }.
 * @returns {Promise<object>} A promise that resolves to the updated PinDto object.
 */
export const updatePin = async (id, pinData) => { // <<< NEW
  try {
    const response = await apiClient.put(`/api/pins/${id}`, pinData);
    return response.data;
  } catch (error) {
    console.error(`Error updating pin ${id}:`, error);
    // Handle specific errors like 404 Not Found
    throw error;
  }
};

/**
 * Deletes a pin.
 * @param {number} id - The ID of the pin to delete.
 * @returns {Promise<void>} A promise that resolves when deletion is successful.
 */
export const deletePin = async (id) => { // <<< NEW
  try {
    await apiClient.delete(`/api/pins/${id}`);
    // DELETE typically returns 204 No Content, so no response data expected
  } catch (error) {
    console.error(`Error deleting pin ${id}:`, error);
    throw error;
  }
};


// --- We will add more functions here later (fetchNearbyPins, fetchTags) ---
/**
 * Fetches pins within a specified radius of given coordinates.
 * @param {number} lat Latitude of the center point.
 * @param {number} lng Longitude of the center point.
 * @param {number} radius Radius in meters.
 * @returns {Promise<Array>} A promise that resolves to an array of nearby PinDto objects.
 */
export const fetchNearbyPins = async (lat, lng, radius) => { // <<< NEW
    try {
      // Use URLSearchParams for cleaner query parameter handling
      const params = new URLSearchParams({ lat, lng, radius });
      const response = await apiClient.get(`/api/pins/nearby?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching nearby pins:", error);
      throw error;
    }
  };
// export const fetchTags = async () => { ... };

/**
 * Fetches a list of all unique tag names used across all pins.
 * @returns {Promise<Array<string>>} A promise that resolves to an array of tag name strings.
 */
export const fetchTags = async () => { // <<< NEW function
    try {
      const response = await apiClient.get('/api/tags');
      return response.data || []; // Ensure returning an array
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw error;
    }
  };

export default apiClient;