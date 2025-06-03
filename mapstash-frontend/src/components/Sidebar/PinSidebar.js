import React, { useState, useMemo, useEffect, useRef } from 'react';

// --- MUI Imports ---
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import List from '@mui/material/List';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

// --- Custom Imports ---
import PinForm from './PinForm';
import PinCard from './PinCard';
import PinDetailView from './PinDetailView'; // <<< Import the new component

// --- Component ---
/**
 * PinSidebar Component: Displays list, details, or forms for managing pins.
 */
function PinSidebar({
  mode = 'list',
  pinData = null,      // Data for EDIT/VIEW modes
  newPinCoords = null, // Coords for ADD mode
  pinsToList = [],     // Full list for 'list' mode display/filtering
  activePinId = null,  // ID of selected pin for highlighting/scrolling
  onSave,              // -> PinForm
  onEditRequest,       // -> PinCard, PinDetailView
  onDeleteRequest,     // -> PinCard, PinDetailView
  onSelectItem,        // -> PinCard
  onAddNew,            // -> Add Button
  onCancel,            // -> PinForm, PinDetailView (for Back/Close)
  availableTags = [],  // -> PinForm
  isSaving = false,    // -> PinForm
  isLoadingList = true // -> List View
}) {

  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const listRef = useRef(null); // Ref for the scrollable List container

  // --- Filtering Logic (for 'list' mode) ---
  const filteredPins = useMemo(() => {
    // Filtering only applies when in list mode
    if (mode !== 'list') return []; // Return empty if not in list mode (or pinsToList if preferred, but filtering is irrelevant)

    if (!searchTerm) {
      return pinsToList; // No search term, return all pins
    }
    const lowerSearchTerm = searchTerm.toLowerCase().trim();
    if (!lowerSearchTerm) {
        return pinsToList; // Handle empty/whitespace search
    }

    return pinsToList.filter(pin => {
      const titleMatch = pin.title?.toLowerCase().includes(lowerSearchTerm);
      const notesMatch = pin.notes?.toLowerCase().includes(lowerSearchTerm);
      const tagMatch = pin.tags?.some(tag => tag.name?.toLowerCase().includes(lowerSearchTerm));
      return titleMatch || notesMatch || tagMatch;
    });
    // Ensure dependencies cover mode change as well, though filter runs only in list mode
  }, [pinsToList, searchTerm, mode]);

  // --- Scroll Effect (for 'list' mode) ---
  useEffect(() => {
    if (mode === 'list' && activePinId && listRef.current) {
      const activeElement = listRef.current.querySelector(`#pin-card-${activePinId}`);
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [activePinId, mode]);


  // --- Handlers ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Called when a PinCard itself is clicked in the list view
  const handleCardClick = (pinId) => { // Accepts pinId
    if (onSelectItem) {
      onSelectItem(pinId); // Pass the ID up to App.js
    }
  };

  // --- Render Logic ---

  const renderMainContent = () => {
    switch (mode) {
      // --- ADD/EDIT MODE: Render PinForm ---
      case 'add':
      case 'edit':
        return (
          <>
            {/* Shared Form Header */}
            <Box sx={{ p: 1, px: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
               <Typography variant="h6" component="h2">
                    {mode === 'add' ? 'Add New Location' : 'Edit Location'}
               </Typography>
               <Tooltip title="Cancel">
                  <span> {/* Span for tooltip on disabled button */}
                    <IconButton onClick={onCancel} disabled={isSaving} size="small" aria-label="Cancel">
                        <CloseIcon />
                    </IconButton>
                  </span>
               </Tooltip>
            </Box>
            {/* Form Component */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto' }}> {/* Make form area scrollable if needed */}
              <PinForm
                // Use pinData.id for edit key, 'add' for add key to ensure form resets correctly
                key={mode === 'edit' ? (pinData?.id || 'edit-fallback') : 'add'}
                mode={mode}
                initialData={mode === 'edit' ? pinData : null}
                initialCoords={mode === 'add' ? newPinCoords : null}
                onSave={onSave}
                onCancel={onCancel}
                availableTags={availableTags}
                isSaving={isSaving}
              />
            </Box>
          </>
        );

      // --- VIEW MODE: Render PinDetailView ---
      case 'view':
        // pinData should contain the data for the selected pin (set by App.js)
        return (
            <PinDetailView
                pin={pinData}
                onClose={onCancel} // Reuse onCancel for the "Back/Close" action
                onEditRequest={onEditRequest} // Pass down edit handler
                onDeleteRequest={onDeleteRequest} // Pass down delete handler
            />
        );


      // --- LIST MODE (and default): Render Pin List ---
      case 'list':
      default:
        return (
          // Pass ref to the List component itself for scrolling
          <List ref={listRef} sx={{ width: '100%', bgcolor: 'background.paper', overflowY: 'auto', p: 1, flexGrow: 1 }} aria-label="Saved Locations List">
            {isLoadingList ? (
                <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3}}>
                    <CircularProgress />
                </Box>
            ) : filteredPins.length === 0 ? (
                <Alert severity="info" sx={{ m: 1 }}>
                    {pinsToList.length === 0 ? 'No saved locations yet. Click the "+" button or click on the map to add one!' : 'No locations match your search.'}
                </Alert>
            ) : (
                 filteredPins.map(pin => (
                    // The Box wrapper is the target for scrollIntoView
                    <Box key={pin.id} id={`pin-card-${pin.id}`} sx={{ mb: 1 }}>
                        <PinCard
                            pin={pin}
                            isActive={pin.id === activePinId}
                            // Pass handleCardClick which now expects pinId
                            onClick={handleCardClick}
                            onEditRequest={onEditRequest} // Pass handlers through
                            onDeleteRequest={onDeleteRequest}
                        />
                    </Box>
                 ))
             )}
          </List>
        );
    }
  };

  // --- Component Return ---
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.default' }}>

      {/* Toolbar (Search + Add Button) - Only shown in 'list' mode */}
      {mode === 'list' && (
         <AppBar position="static" color="default" elevation={1} sx={{flexShrink: 0}}> {/* Prevent toolbar from shrinking */}
            <Toolbar variant="dense">
              {/* Search Input */}
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="Filter saved pins..." // Clarify placeholder
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ mr: 1 }}
              />
              {/* Add New Pin Button */}
              <Tooltip title="Add New Pin (Click Map First)">
                <span> {/* Span for tooltip */}
                  <IconButton
                    color="primary"
                    onClick={onAddNew}
                    disabled={isLoadingList} // Disable if list is still loading initially
                    aria-label="Add New Pin"
                   >
                    <AddLocationAltIcon />
                  </IconButton>
                </span>
              </Tooltip>
            </Toolbar>
          </AppBar>
       )}

      {/* --- Main Content Area (List, View, or Form) --- */}
      {/*
        This Box needs to contain the specific view based on mode.
        The views themselves handle internal scrolling if needed.
        Using flexGrow ensures this area takes up remaining space.
      */}
      <Box sx={{ flexGrow: 1, overflowY: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column' }}>
         {renderMainContent()}
      </Box>
    </Box>
  );
}

export default PinSidebar;