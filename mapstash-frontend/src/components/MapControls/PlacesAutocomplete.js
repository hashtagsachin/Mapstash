import React, { useState, useCallback, useRef } from 'react';
import { Autocomplete } from '@react-google-maps/api';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

/**
 * PlacesAutocomplete Component: Renders a search input using Google Places Autocomplete.
 * @param {object} props - Component props.
 * @param {function} props.onPlaceSelect - Callback function when a place is selected. Receives the place object.
 * @param {boolean} props.isLoaded - Passed down, indicates if Google Maps script (with 'places') is loaded.
 */
function PlacesAutocomplete({ onPlaceSelect, isLoaded }) {
  // State to hold the Autocomplete instance
  const [autocomplete, setAutocomplete] = useState(null);
  // Ref for the input field (optional, sometimes useful)
  const inputRef = useRef(null);

  // Callback for when the Autocomplete component loads
  const onLoad = useCallback((autocompleteInstance) => {
    console.log('Places Autocomplete loaded:', autocompleteInstance);
    setAutocomplete(autocompleteInstance);
  }, []);

  // Callback for when the user selects a place from the suggestions
  const onPlaceChanged = useCallback(() => {
    if (autocomplete !== null) {
      const place = autocomplete.getPlace(); // Get the selected place details
      console.log('Place selected:', place);

      // Check if the place has geometry (coordinates/viewport)
      if (place.geometry) {
          // Call the handler passed from the parent component
          if (onPlaceSelect) {
            onPlaceSelect(place);
          }
      } else {
        console.warn("Selected place does not have geometry:", place);
        // Optionally alert user or handle differently
      }
    } else {
      console.error('Autocomplete instance is not loaded yet.');
    }
  }, [autocomplete, onPlaceSelect]); // Dependencies

  // Render nothing if the Google Maps script (with places library) isn't loaded yet
  if (!isLoaded) {
      return null;
  }

  return (
    // The Autocomplete component wraps the input field
    <Autocomplete
      onLoad={onLoad}
      onPlaceChanged={onPlaceChanged}
      // Optional: Restrict search bounds or types
      // options={{
      //   // types: ['geocode', 'establishment'],
      //   // componentRestrictions: { country: 'us' },
      // }}
    >
      {/* Use MUI TextField for the input appearance */}
      <TextField
        inputRef={inputRef} // Attach ref if needed
        placeholder="Search for places..."
        variant="outlined"
        size="small" // Make it less tall
        sx={{
          width: '300px', // Adjust width as needed
          backgroundColor: 'white', // Make background opaque
          borderRadius: 1, // Match TextField rounding
          '& .MuiOutlinedInput-root': { // Style the input container
              '& fieldset': {
                  // borderColor: 'rgba(0, 0, 0, 0.23)', // Default border
              },
              '&:hover fieldset': {
                  // borderColor: 'rgba(0, 0, 0, 0.87)', // Default hover
              },
              '&.Mui-focused fieldset': {
                  // borderColor: 'primary.main', // Default focus
              },
          },
        }}
        InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
        }}
      />
    </Autocomplete>
  );
}

export default PlacesAutocomplete;