import React, { useState, useCallback, useEffect } from 'react';
// Import React hooks: useState for state, useCallback for memoizing functions, useEffect for side effects

// --- Import Custom Components ---
import MapContainer from './components/MapContainer/MapContainer';
import PinSidebar from './components/Sidebar/PinSidebar';
import FindNearbyButton from './components/MapControls/FindNearbyButton';
// import PlacesAutocomplete from './components/MapControls/PlacesAutocomplete'; // Assuming you might add this back later

// --- Import Material UI Components ---
import CssBaseline from '@mui/material/CssBaseline'; // Applies baseline browser style normalization
import { ThemeProvider, createTheme } from '@mui/material/styles'; // For custom theming
import Box from '@mui/material/Box'; // General purpose layout container
import Snackbar from '@mui/material/Snackbar'; // For displaying notifications
import Alert from '@mui/material/Alert'; // Styled messages within Snackbar
import Dialog from '@mui/material/Dialog'; // For confirmation dialogs
import DialogActions from '@mui/material/DialogActions'; // Container for dialog buttons
import DialogContent from '@mui/material/DialogContent'; // Container for dialog content
import DialogContentText from '@mui/material/DialogContentText'; // Text within dialog content
import DialogTitle from '@mui/material/DialogTitle'; // Title for dialog
import Button from '@mui/material/Button'; // Standard button component

// --- Import API Service Functions ---
// Make sure fetchTags is imported
import { createPin, updatePin, deletePin, fetchPins, fetchNearbyPins, fetchTags } from './services/api';

// --- Configuration ---

// Define a basic MUI theme
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
  },
});

// Sidebar width and nearby radius constants
const drawerWidth = 360;
const DEFAULT_NEARBY_RADIUS_METERS = 5000;

// --- Main App Component ---

function App() {
  // --- State Variables ---

  // Sidebar state
  const [sidebarMode, setSidebarMode] = useState('list'); // 'list', 'add', 'edit', 'view'
  const [selectedPinData, setSelectedPinData] = useState(null); // For edit/view form data
  const [newPinCoords, setNewPinCoords] = useState(null); // For add form coords

  // Interaction state (Pin Selection)
  const [activePinId, setActivePinId] = useState(null);

  // Temporary marker states
  const [tempMarkerPos, setTempMarkerPos] = useState(null); // Marker for adding a new pin by clicking map
  const [searchMarkerPos, setSearchMarkerPos] = useState(null); // Marker for places search result

  // Map data state
  const [allPins, setAllPins] = useState([]); // Holds all pins fetched from API
  const [nearbyPins, setNearbyPins] = useState([]); // Holds pins from nearby search
  const [isNearbyMode, setIsNearbyMode] = useState(false); // Tracks if showing nearby pins
  const [userLocation, setUserLocation] = useState(null); // User's {lat, lng} from geolocation
  const [isLoadingMapData, setIsLoadingMapData] = useState(true); // Tracks loading for API calls (pins, nearby, save, delete)
  const [mapError, setMapError] = useState(null); // Error messages for pin fetching
  const [availableTags, setAvailableTags] = useState([]); // State for Autocomplete suggestions

  // UI Feedback state
  const [refreshMapDataKey, setRefreshMapDataKey] = useState(0); // Key to trigger data reload
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'info' }); // Snackbar state

  // Delete confirmation dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pinToDeleteId, setPinToDeleteId] = useState(null); // ID of pin being confirmed for deletion

  // --- Handlers & Effects ---

  // Close Snackbar notification
  const handleCloseNotification = (event, reason) => {
      if (reason === 'clickaway') return;
      setNotification({ ...notification, open: false });
  };

  // Fetch initial pins and tags
  const loadInitialData = useCallback(async () => {
    console.log("Fetching initial data (pins and tags)...");
    setIsLoadingMapData(true);
    setMapError(null);
    try {
      const [pinsData, tagsData] = await Promise.all([
        fetchPins(),
        fetchTags() // Fetch tags for autocomplete
      ]);
      setAllPins(pinsData || []);
      setAvailableTags(tagsData || []); // Store tags
      console.log("Available tags fetched:", tagsData);
      console.log("All pins fetched:", pinsData);
    } catch (err) {
      console.error("Failed to fetch initial data:", err);
      setMapError("Could not load initial map data.");
      setAllPins([]);
      setAvailableTags([]);
      setNotification({ open: true, message: 'Error loading initial data.', severity: 'error' });
    } finally {
      console.log(">>> loadInitialData FINALLY block executing <<<");
      setIsLoadingMapData(false); // Ensure loading state is turned off
    }
  }, []); // Stable function

  // Effect to load initial data on mount or when refresh key changes (if not in nearby mode)
  useEffect(() => {
    if (!isNearbyMode) {
        loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadInitialData, refreshMapDataKey, isNearbyMode]); // Dependency on loadInitialData, refreshMapDataKey, isNearbyMode

  // --- >>> UPDATED Select Item handler (Map Marker or Sidebar List Click) <<< ---
  const handleSelectItem = useCallback((pinId) => {
      if (!pinId) { // Handle case where selection is cleared
        setActivePinId(null);
        setSelectedPinData(null);
        // Decide if clearing selection should always go back to list
        // if (sidebarMode === 'view' || sidebarMode === 'edit') {
        //    setSidebarMode('list');
        // }
        return;
      }

      console.log("Selecting Pin ID:", pinId);

      // Determine which list to search based on current mode
      const sourceList = isNearbyMode ? nearbyPins : allPins;
      const pinToView = sourceList.find(p => p.id === pinId);

      if (pinToView) {
          console.log("Found pin to view:", pinToView.title);
          setActivePinId(pinId);       // Set the active ID for highlighting/map bounce
          setSelectedPinData(pinToView); // Set the data for the detail view/edit form
          setSidebarMode('view');      // <<< SWITCH TO VIEW MODE >>>
          setTempMarkerPos(null);      // Clear temporary add marker if any
          setSearchMarkerPos(null);    // Clear temporary search marker if any
          setNewPinCoords(null);       // Clear any potential coords from 'add' mode
      } else {
          console.warn(`Pin with ID ${pinId} not found in ${isNearbyMode ? 'nearbyPins' : 'allPins'} list.`);
          // Optionally handle case where pin isn't found (e.g., clear selection)
          // setActivePinId(null);
          // setSelectedPinData(null);
          // setSidebarMode('list');
      }
  // Dependencies: Need access to pin lists and mode, plus setters
  }, [ isNearbyMode, allPins, nearbyPins, setActivePinId, setSelectedPinData, setSidebarMode, setTempMarkerPos, setSearchMarkerPos, setNewPinCoords ]);
  // --- >>> END OF UPDATED Select Item handler <<< ---

  // Prepare Add Pin handler (Map Click or Add New Button)
  const handlePrepareAddPin = useCallback((coords = null) => {
      console.log("Preparing to Add Pin. Coords received:", coords);
      setSidebarMode('add');
      setActivePinId(null);     // Clear any active selection
      setSelectedPinData(null); // Clear any edit/view data
      setSearchMarkerPos(null); // Clear search marker

      if (coords) { // Clicked on map
          console.log("Setting coords for new pin from map click:", coords);
          setNewPinCoords(coords);
          setTempMarkerPos(coords); // Show temporary marker where clicked
      } else { // Clicked "Add New" button in sidebar
          console.log("Clearing coords/temp marker for new pin form");
          setNewPinCoords(null); // Form will require click on map or manual entry later
          setTempMarkerPos(null);
      }
  }, [setSidebarMode, setActivePinId, setSelectedPinData, setSearchMarkerPos, setNewPinCoords, setTempMarkerPos]); // Dependencies: setters are stable

  // Close Sidebar action handler (resets state) - Called on Cancel/X/Back
  const handleCancelSidebarAction = useCallback(() => {
      console.log("Cancelling sidebar action (or closing View), returning to list view");
      setSidebarMode('list'); // Go back to list view
      setTempMarkerPos(null);
      setSearchMarkerPos(null);
      setActivePinId(null); // Clear active pin
      setSelectedPinData(null); // Clear selected data
      setNewPinCoords(null); // Clear add coords
  }, [setSidebarMode, setTempMarkerPos, setSearchMarkerPos, setActivePinId, setSelectedPinData, setNewPinCoords]); // Dependencies: setters are stable

  // Edit Request handler (from PinSidebar/PinDetailView)
  const handleEditRequest = useCallback((pinToEdit) => {
      console.log("Edit request for:", pinToEdit);
      if (!pinToEdit || !pinToEdit.id) {
        console.warn("Edit request called without valid pin data.");
        return;
      }
      // Ensure the pin data is up-to-date if needed, though usually the one passed is fine
      // const currentPinData = (isNearbyMode ? nearbyPins : allPins).find(p => p.id === pinToEdit.id) || pinToEdit;
      setSelectedPinData(pinToEdit); // Pre-populate form with passed data
      setSidebarMode('edit');        // Switch mode
      setActivePinId(pinToEdit.id);  // Ensure it remains active
      setTempMarkerPos(null);
      setSearchMarkerPos(null);
      setNewPinCoords(null);         // Not adding, editing existing
  }, [setSelectedPinData, setSidebarMode, setActivePinId, setTempMarkerPos, setSearchMarkerPos, setNewPinCoords]); // Dependencies: setters are stable

  // Save Pin handler (Create/Update) - Called FROM PinSidebar
  const handleSavePin = async (formData) => {
      console.log("Save Pin requested:", formData);
      setIsLoadingMapData(true); // Use global loading state for save operation
      setNotification({ open: false, message: '', severity: 'info' });
      let savedPin;
      let success = false;
      let isUpdate = sidebarMode === 'edit'; // Track if it was an update

      try {
          if (sidebarMode === 'add') {
              if (!newPinCoords) {
                  throw new Error("Cannot save pin without coordinates. Please click on the map.");
              }
              const createData = {
                  title: formData.title, notes: formData.notes, tags: formData.tags,
                  latitude: newPinCoords.lat, longitude: newPinCoords.lng,
              };
              console.log("Creating Pin with data:", createData);
              savedPin = await createPin(createData);
              setNotification({ open: true, message: 'Pin created successfully!', severity: 'success' });
          } else if (sidebarMode === 'edit') {
              if (!formData.id) {
                 throw new Error("Cannot update pin without ID.");
              }
              const updateData = {
                  title: formData.title, notes: formData.notes, tags: formData.tags,
                  // Note: We are NOT updating coordinates here, keep existing lat/lng
              };
              console.log(`Updating Pin ID ${formData.id} with data:`, updateData);
              savedPin = await updatePin(formData.id, updateData);
              setNotification({ open: true, message: 'Pin updated successfully!', severity: 'success' });
          } else {
              throw new Error("Invalid mode for saving pin.");
          }

          console.log("Saved Pin response:", savedPin);
          success = true;

      } catch (error) {
          // Handle save errors and show notification
          console.error("Failed to save pin:", error);
          let errorMsg = error.message || 'Failed to save pin.';
          if (error.response) { errorMsg = error.response.data?.message || errorMsg; errorMsg += ` (Status: ${error.response.status})`;}
          else if (error.request) { errorMsg = 'No response from server.'; }
          setNotification({ open: true, message: errorMsg, severity: 'error' });
      } finally {
          setIsLoadingMapData(false); // Turn off loading indicator
          if (success) {
              setIsNearbyMode(false); // Ensure showing all pins after change
              setRefreshMapDataKey(prevKey => prevKey + 1); // Trigger reload (includes tags)

              if (isUpdate && savedPin) {
                 // If updated successfully, go back to VIEW mode for the updated pin
                 setActivePinId(savedPin.id);
                 setSelectedPinData(savedPin); // Use the potentially updated data from response
                 setSidebarMode('view');
                 setTempMarkerPos(null);
                 setSearchMarkerPos(null);
              } else {
                 // If created successfully, go back to LIST mode
                 handleCancelSidebarAction();
              }
          }
          // If save failed, we keep the form open for correction
      }
  };

  // Delete Request handler (Opens Dialog) - Called FROM PinSidebar/PinDetailView
  const handleDeleteRequest = useCallback((idToDelete) => {
      console.log("Delete requested for Pin ID:", idToDelete);
      if (!idToDelete) return;
      setPinToDeleteId(idToDelete); // Store ID
      setDeleteDialogOpen(true);   // Open dialog
  }, [setPinToDeleteId, setDeleteDialogOpen]); // Dependencies: setters are stable

  // Confirm Delete handler (Calls API)
  const confirmDeletePin = async () => {
    if (!pinToDeleteId) return;
    console.log("Confirming delete for Pin ID:", pinToDeleteId);
    setIsLoadingMapData(true); // Use global loading state for delete operation
    setNotification({ open: false, message: '', severity: 'info' });
    setDeleteDialogOpen(false); // Close dialog immediately

    try {
        await deletePin(pinToDeleteId); // Call API
        console.log("Deleted Pin ID:", pinToDeleteId);
        setNotification({ open: true, message: 'Pin deleted successfully!', severity: 'success' });
        handleCancelSidebarAction(); // Reset sidebar to list view
        setIsNearbyMode(false); // Ensure showing all pins after delete
        setRefreshMapDataKey(prevKey => prevKey + 1); // Trigger reload (includes tags)
    } catch (error) {
         // Handle delete errors and show notification
         console.error("Failed to delete pin:", error);
         let errorMsg = 'Failed to delete pin.';
         if (error.response) { errorMsg = error.response.data?.message || errorMsg; errorMsg += ` (Status: ${error.response.status})`;}
         else if (error.request) { errorMsg = 'No response from server.'; }
         else { errorMsg = error.message; }
         setNotification({ open: true, message: errorMsg, severity: 'error' });
    } finally {
        setIsLoadingMapData(false); // Turn off loading indicator
        setPinToDeleteId(null); // Clear the ID
    }
  };

  // Close Delete Dialog handler
  const handleCloseDeleteDialog = () => {
      if (isLoadingMapData) return; // Prevent closing while deleting
      setDeleteDialogOpen(false);
      setPinToDeleteId(null);
  };

  // Find Nearby handler
  const handleFindNearby = () => {
    if (!navigator.geolocation) {
        setNotification({ open: true, message: 'Geolocation is not supported.', severity: 'warning' });
        return;
    }
    console.log("Attempting to get user location...");
    setIsLoadingMapData(true);
    setMapError(null);
    setNotification({ open: false, message: '', severity: 'info' });
    // Reset interaction state for nearby mode
    setActivePinId(null);
    setSelectedPinData(null); // Clear selected pin when going to nearby
    setTempMarkerPos(null);
    setSearchMarkerPos(null);
    setSidebarMode('list'); // Ensure sidebar shows list if it was in add/edit/view

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const userCoords = { lat: latitude, lng: longitude };
        console.log("User location obtained:", userCoords);
        setUserLocation(userCoords);
        try {
          console.log(`Fetching nearby pins around ${latitude}, ${longitude}...`);
          const nearbyData = await fetchNearbyPins(latitude, longitude, DEFAULT_NEARBY_RADIUS_METERS);
          console.log("Fetched Nearby Pins:", nearbyData);
          setNearbyPins(nearbyData || []);
          setIsNearbyMode(true); // Switch to nearby mode *after* successful fetch
          setNotification({ open: true, message: `Showing ${nearbyData.length} pins nearby.`, severity: 'success' });
        } catch (error) {
           console.error("Failed to fetch nearby pins:", error);
           setMapError("Could not find nearby locations.");
           setNearbyPins([]);
           setIsNearbyMode(false); // Stay in 'all' mode if fetch fails
           setUserLocation(null);
           setNotification({ open: true, message: 'Error finding nearby pins.', severity: 'error' });
        } finally {
          setIsLoadingMapData(false);
        }
      },
      (error) => {
        console.error("Error getting user location:", error);
        let message = 'Could not get your location.';
        switch(error.code) {
            case error.PERMISSION_DENIED: message = "Location permission denied."; break;
            case error.POSITION_UNAVAILABLE: message = "Location information unavailable."; break;
            case error.TIMEOUT: message = "Location request timed out."; break;
            default: break;
        }
        setNotification({ open: true, message: message, severity: 'error' });
        setUserLocation(null);
        setIsNearbyMode(false); // Ensure not in nearby mode if location fails
        setIsLoadingMapData(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Show All handler
  const handleShowAll = () => {
    console.log("Switching to show all pins.");
    setIsNearbyMode(false);
    setUserLocation(null);
    setNearbyPins([]);
    setMapError(null); // Clear map error when showing all
    setActivePinId(null); // Clear selection when switching modes
    setSelectedPinData(null); // Clear selected data
    setTempMarkerPos(null);
    setSearchMarkerPos(null);
    setSidebarMode('list'); // Ensure sidebar shows list
    setNotification({ open: true, message: 'Showing all pins.', severity: 'info' });
    // Trigger reload of all pins using the effect dependency
    setRefreshMapDataKey(prevKey => prevKey + 1);
  };

  // Places Search Result handler (called from PlacesAutocomplete via MapContainer)
   const handleSearchResult = useCallback((coords, placeResult = null) => { // Added placeResult
      if (coords) {
          console.log("Setting search result marker at:", coords, "Place:", placeResult);
          setSearchMarkerPos(coords);
          setTempMarkerPos(null);
          setActivePinId(null); // Clear active pin when searching
          setSelectedPinData(null); // Clear selected pin data
          setSidebarMode('list'); // Go back to list mode when searching
      } else {
          console.log("Clearing search result marker.");
          setSearchMarkerPos(null);
      }
   // Dependencies include setters and maybe handlePrepareAddPin if auto-add is used
   }, [setActivePinId, setSelectedPinData, setSidebarMode, setTempMarkerPos, setSearchMarkerPos]);

  // --- Determine Pins to Display ---
  const pinsToDisplayOnMap = isNearbyMode ? nearbyPins : allPins;
  // Sidebar list depends on mode. If list, show allPins (for now). If nearby, maybe show nearbyPins? Let's keep it simple first.
  const pinsToDisplayInSidebarList = allPins; // We will refine this later if needed for nearby mode list


  // --- SX Styles for Main Content Area ---
  const mainBoxSx = {
    flexGrow: 1,
    height: '100vh',
    overflow: 'hidden',
    position: 'relative', // Needed for positioning map controls like PlacesAutocomplete absolutely
 };

  // --- Render ---
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>

        {/* Sidebar Area */}
        <Box
            component="aside"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                height: '100vh',
                overflowY: 'auto', // Allow sidebar content to scroll if needed
                borderRight: (th) => `1px solid ${th.palette.divider}`,
                boxSizing: 'border-box',
                display: 'flex', // Use flexbox for internal layout
                flexDirection: 'column', // Stack items vertically
            }}
        >
          {/* Pass all necessary props and handlers to PinSidebar */}
          <PinSidebar
            mode={sidebarMode}
            // Pass pinData for View/Edit modes
            pinData={selectedPinData}
            newPinCoords={newPinCoords} // For Add form (coords set by map click)
            // Pass the correct list for the 'list' mode display
            pinsToList={pinsToDisplayInSidebarList}
            activePinId={activePinId} // Pass activePinId for highlighting
            availableTags={availableTags}
            isSaving={isLoadingMapData && (sidebarMode === 'add' || sidebarMode === 'edit')} // Pass loading state specifically for save actions
            isLoadingList={isLoadingMapData && sidebarMode === 'list' && !isNearbyMode} // Loading state specific to fetching all pins for the list
            // Actions FROM sidebar TO App
            onSave={handleSavePin} // When form's save button is clicked
            onEditRequest={handleEditRequest} // When edit button on PinCard/PinDetailView is clicked
            onDeleteRequest={handleDeleteRequest} // When delete button on PinCard/PinDetailView is clicked
            onSelectItem={handleSelectItem} // When a PinCard in the list is clicked
            onAddNew={() => handlePrepareAddPin(null)} // When the "Add New Pin" button is clicked
            // Pass cancel handler for Back/Cancel buttons in View/Edit/Add modes
            onCancel={handleCancelSidebarAction}
          />
        </Box>

        {/* Map Content Area */}
        <Box component="main" sx={mainBoxSx}>
          {/* Position PlacesAutocomplete over the map - adjust top/left/zIndex as needed */}
          {/* <PlacesAutocomplete onPlaceSelected={handleSearchResult} /> */}

          <MapContainer
            pins={pinsToDisplayOnMap} // Pass filtered/all pins for map markers
            activePinId={activePinId} // Pass activePinId for marker bounce/InfoWindow
            tempMarkerPos={tempMarkerPos} // Show temporary marker for adding
            searchMarkerPos={searchMarkerPos} // Show temporary marker for search result
            userLocation={userLocation} // Show user location marker in nearby mode
            isLoading={isLoadingMapData && (pinsToDisplayOnMap.length === 0)} // Show loading overlay on map only if truly loading initial/nearby data
            mapError={mapError}
            // Actions FROM map TO App
            onMapClick={handlePrepareAddPin} // Clicking map triggers add mode preparation
            onMarkerClick={handleSelectItem} // Clicking existing marker selects it
            onSearchResult={handleSearchResult} // Callback from internal Places search if needed
          />
          <FindNearbyButton
             onFindNearby={handleFindNearby}
             onShowAll={handleShowAll}
             isNearbyMode={isNearbyMode}
             isLoading={isLoadingMapData && (userLocation === null)} // Indicate loading specifically during geolocation/nearby fetch
             sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000 }} // Example positioning
          />
        </Box>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} aria-labelledby="delete-dialog-title">
            <DialogTitle id="delete-dialog-title">{"Confirm Deletion"}</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to permanently delete this pin? This cannot be undone.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleCloseDeleteDialog} color="primary" disabled={isLoadingMapData}>Cancel</Button>
                <Button onClick={confirmDeletePin} color="error" autoFocus disabled={isLoadingMapData}>
                    {isLoadingMapData ? 'Deleting...' : 'Delete'}
                </Button>
            </DialogActions>
        </Dialog>

         {/* Notification Snackbar */}
         <Snackbar
             open={notification.open}
             autoHideDuration={6000}
             onClose={handleCloseNotification}
             anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
         >
             {/* Wrapping Alert in a check prevents rendering empty Snackbar */}
             {notification.open && notification.severity && (
                  <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }} variant="filled">
                      {notification.message}
                  </Alert>
             )}
         </Snackbar>

      </Box>
    </ThemeProvider>
  );
}

export default App;