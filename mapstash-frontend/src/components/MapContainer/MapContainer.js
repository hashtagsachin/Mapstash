import React, { useEffect, useCallback, useRef } from 'react';
// Import React hooks

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
// Import Google Maps components

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert'; // Import Alert for errors
// Import Material UI components

// Import custom components used within MapContainer
import PlacesAutocomplete from '../MapControls/PlacesAutocomplete';

// --- Configuration ---
const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const containerStyle = { width: '100%', height: '100%' };
const defaultCenter = { lat: 51.5074, lng: -0.1278 }; // London
const defaultZoom = 12;
const libraries = ['places']; // Ensure 'places' library is loaded

// --- Component ---
/**
 * MapContainer Component: Displays the Google Map, markers, and handles basic interactions.
 * ... (rest of props documentation) ...
 * @param {number|string|null} props.activePinId - The ID of the pin to highlight on the map.
 */
function MapContainer({
    pins = [],
    tempMarkerPos,
    searchMarkerPos,
    userLocation,
    isLoading, // General loading state from App
    mapError, // Error message related to fetching pins/nearby
    activePinId, // Accept activePinId prop
    onMapClick, // Callback for clicking the map background
    onMarkerClick, // Callback for clicking a permanent pin marker
    onSearchResult // Callback when a Places search result is selected
}) {

  const { isLoaded, loadError: scriptLoadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: apiKey,
    libraries: libraries,
  });

  const mapRef = useRef(null); // Ref to store the Google Map instance

  // --- Define Icon Objects ---
  // Memoize icons based on isLoaded status to avoid redefining on every render
  const tempMarkerIcon = React.useMemo(() => isLoaded ? {
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: '#4285F4', fillOpacity: 0.7, strokeColor: '#FFFFFF', strokeWeight: 1.5, scale: 8,
  } : null, [isLoaded]);
  const userLocationIcon = React.useMemo(() => isLoaded ? {
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: '#1976D2', fillOpacity: 1.0, strokeColor: '#FFFFFF', strokeWeight: 2, scale: 8,
  } : null, [isLoaded]);
  const searchMarkerIcon = React.useMemo(() => isLoaded ? {
    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
    fillColor: '#FF9800', fillOpacity: 0.9, strokeColor: '#FFFFFF', strokeWeight: 1.5, scale: 6, rotation: 90,
  } : null, [isLoaded]);


  // --- Map Centering/Panning Logic ---
  const panToLocation = useCallback((location, viewport = null) => {
      if (mapRef.current && isLoaded) { // Ensure map and API are loaded
          if (viewport) {
              console.log("Fitting bounds to viewport:", viewport);
              mapRef.current.fitBounds(viewport);
          } else if (location) {
              console.log("Panning map to location:", location);
              mapRef.current.panTo(location);
              // Avoid zooming too far when just panning
              if (mapRef.current.getZoom() < 13) {
                mapRef.current.setZoom(15);
              }
          }
      } else {
          console.warn("panToLocation called before map/API is loaded or mapRef is null.");
      }
  }, [isLoaded]); // Dependency on isLoaded

  // Effect for panning to user location when it changes
  useEffect(() => {
      if (userLocation && isLoaded) { // Check isLoaded
          panToLocation(userLocation, null);
      }
  }, [userLocation, panToLocation, isLoaded]);

  // Effect for panning to ACTIVE pin when activePinId changes
  useEffect(() => {
      if (activePinId && isLoaded) { // Check isLoaded
          const activePin = pins.find(p => p.id === activePinId);
          if (activePin && mapRef.current) { // Ensure pin found and mapRef exists
              console.log("Panning to active pin:", activePin.title);
              panToLocation({ lat: activePin.latitude, lng: activePin.longitude });
          }
      }
  }, [activePinId, pins, panToLocation, isLoaded]);


  // --- Map Callbacks ---
  const onLoad = useCallback(function callback(mapInstance) {
    mapRef.current = mapInstance; // Store the map instance in the ref
    console.log('Map loaded');
  }, []); // Empty dependency array means this callback is created only once

  const onUnmount = useCallback(function callback(map) {
    mapRef.current = null; // Clear the ref
    console.log('Map unmounted');
  }, []); // Empty dependency array

  // Callback for map clicks (background)
  const handleMapClick = useCallback((event) => {
    if (!event.latLng) return; // Safety check
    const coords = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    console.log('Map clicked at:', coords);
    if (onMapClick) {
        onMapClick(coords); // Propagate coordinates up to App.js
    }
  }, [onMapClick]);

  // Callback for permanent pin marker clicks
  // <<< FIX: Corrected the body of this function >>>
  const handleMarkerClick = useCallback((pinId) => { // Accepts pinId
    console.log(`Marker clicked: Pin ID ${pinId}`); // Log only the ID now
    // Propagate the pin ID up to the parent component (App.js)
    if (onMarkerClick) {
      onMarkerClick(pinId); // Pass the pinId, not the 'pin' object
    }
  }, [onMarkerClick]); // Recreate if onMarkerClick prop changes

  // Callback for place selection from Autocomplete
  const handlePlaceSelect = useCallback((place) => {
    if (!place || !place.geometry || !place.geometry.location) {
      console.warn("Selected place has no geometry or location.");
      if (onSearchResult) onSearchResult(null, null); // Notify parent that selection was invalid
      return;
    }

    const location = place.geometry.location;
    const viewport = place.geometry.viewport;

    // Pan/zoom the map to the selected place
    panToLocation(location, viewport);

    // Decide whether to show a marker based on place types
    const placeTypes = place.types || [];
    // More robust check for types indicating a specific location vs broad areas
    const showMarkerForTypes = [
        'street_address', 'premise', 'subpremise', 'point_of_interest',
        'establishment', 'natural_feature', 'airport', 'park', 'bus_station',
        'train_station', 'transit_station', 'church', 'hospital', 'school', 'shopping_mall'
        // Add more specific types if needed, avoid overly broad types like 'locality' or 'political'
    ];
    const shouldShowMarker = placeTypes.some(type => showMarkerForTypes.includes(type));

    console.log("Place selected:", place.name, "Types:", placeTypes, "Should show marker:", shouldShowMarker);

    if (onSearchResult) {
        // Pass coordinates (if showing marker) and the full place object for potential use in App.js
        onSearchResult(shouldShowMarker ? location.toJSON() : null, place);
    }
  }, [panToLocation, onSearchResult]); // Dependencies


  // --- Render Logic ---

  // Handle Google Maps script loading errors
  if (scriptLoadError) {
     return (
        <Box sx={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
            <Alert severity="error">Error loading Google Maps script. Please check your API key and network connection.</Alert>
        </Box>
     );
  }

  // Show loading indicator while the script is loading
  if (!isLoaded) {
     return (
        <Box sx={{ ...containerStyle, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
            <Typography sx={{ ml: 2 }}>Loading Map...</Typography>
        </Box>
     );
  }

  // Render the map and controls once loaded
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Loading/Error overlays (for App data loading, not script loading) */}
      {isLoading && (
         <Box sx={{ position: 'absolute', top: 70, left: 10, zIndex: 5, bgcolor: 'rgba(255, 255, 255, 0.8)', p: 1, borderRadius: 1 }}>
            <CircularProgress size={20} sx={{ mr: 1, verticalAlign: 'middle' }} />
            <Typography variant="caption" component="span" sx={{ verticalAlign: 'middle' }}>Loading locations...</Typography>
         </Box>
      )}
      {mapError && (
         <Box sx={{ position: 'absolute', top: 70, left: 10, zIndex: 5, bgcolor: 'rgba(255, 255, 255, 0.8)', p: 1, borderRadius: 1 }}>
            <Alert severity="warning" variant="outlined" sx={{ p: '0 8px' }}>{mapError}</Alert>
         </Box>
      )}

       {/* Places Search Box - Positioned over the map */}
       <Box sx={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 10, width: 'clamp(300px, 60%, 500px)' }}>
         <PlacesAutocomplete onPlaceSelect={handlePlaceSelect} isLoaded={isLoaded} />
       </Box>

     <GoogleMap
       mapContainerStyle={containerStyle}
       center={defaultCenter} // Initial center, panning happens via effects
       zoom={defaultZoom}     // Initial zoom
       onLoad={onLoad}
       onUnmount={onUnmount}
       onClick={handleMapClick} // Handle clicks on map background
       options={{
           clickableIcons: false, // Disable clicking Google's default POIs
           fullscreenControl: false, // Optional: Hide fullscreen button
           streetViewControl: false, // Optional: Hide street view pegman
           mapTypeControl: false, // Optional: Hide map type selector
           zoomControl: true, // Optional: Keep zoom control visible
           // styles: mapStyles, // Optional: Add custom map styling
       }}
     >
       {/* --- Render Markers --- */}

       {/* Temporary marker for adding a new pin */}
       {tempMarkerPos && tempMarkerIcon && (
          <Marker position={tempMarkerPos} icon={tempMarkerIcon} title="New Location (Click Save)" zIndex={10} />
       )}

       {/* Marker for user's current location (nearby mode) */}
       {userLocation && userLocationIcon && (
          <Marker position={userLocation} icon={userLocationIcon} title="Your Location" zIndex={5} />
       )}

       {/* Temporary marker for Places search result */}
       {searchMarkerPos && searchMarkerIcon && (
          <Marker position={searchMarkerPos} icon={searchMarkerIcon} title="Search Result" zIndex={8} />
       )}

       {/* Permanent Pin Markers from the pins array */}
       {pins.map((pin) => {
         const isActive = pin.id === activePinId;
         return (
            <Marker
              key={pin.id}
              position={{ lat: pin.latitude, lng: pin.longitude }}
              title={pin.title} // Tooltip on hover
              onClick={() => handleMarkerClick(pin.id)} // Corrected: Pass only ID
              options={{
                  // Use window.google.maps only after isLoaded is true
                  animation: isActive && isLoaded ? window.google.maps.Animation.BOUNCE : null,
                  zIndex: isActive ? 100 : 1, // Bring active marker to front
                  // icon: customPinIcon, // Optional: Define a custom icon for pins
              }}
            />
         );
       })}
     </GoogleMap>
    </Box>
 );
}

export default MapContainer;