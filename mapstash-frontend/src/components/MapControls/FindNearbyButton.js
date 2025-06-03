import React from 'react';
import Fab from '@mui/material/Fab';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import ListIcon from '@mui/icons-material/List';
import Tooltip from '@mui/material/Tooltip'; // Already imported

/**
 * FindNearbyButton Component: A FAB to trigger finding nearby pins or showing all.
 * Includes Tooltip for clarity.
 * ... (rest of props documentation) ...
 */
function FindNearbyButton({ onFindNearby, onShowAll, isNearbyMode, isLoading }) {
  const fabStyle = {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 1000
  };

  return (
    // Tooltip wraps the button (or span if button can be disabled)
    <Tooltip title={isNearbyMode ? "Show All Pins" : "Find Pins Near Me"} placement="left">
      {/* Span is required for Tooltip to work correctly when the nested Button/FAB is disabled */}
      <span>
        <Fab
          color="primary"
          aria-label={isNearbyMode ? "show all pins" : "find nearby pins"}
          sx={fabStyle}
          onClick={isNearbyMode ? onShowAll : onFindNearby}
          disabled={isLoading} // Disable button while loading data
        >
          {/* Change icon based on the current mode */}
          {isNearbyMode ? <ListIcon /> : <MyLocationIcon />}
        </Fab>
      </span>
    </Tooltip>
  );
}

export default FindNearbyButton;