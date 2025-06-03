import React from 'react';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useTheme } from '@mui/material/styles';

// --- Helper Functions for Tag Colors ---
function stringToHslColor(str, s = 60, l = 75) {
    if (!str) return `hsl(0, ${s}%, ${l}%)`; // Fallback for null/empty strings
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
        hash = hash & hash; // Convert to 32bit integer
    }
    const h = Math.abs(hash % 360); // Ensure positive hue
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function getContrastYIQ(hslColor) {
    try {
        // Extract L value (more robust extraction)
        const match = hslColor.match(/hsl\(\s*\d+\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)/);
        if (!match || match.length < 3) return '#333333'; // Fallback
        const lightness = parseInt(match[2]); // L is the second capture group (%)
        return (lightness >= 60) ? '#333333' : '#FFFFFF'; // Dark text on light bg, white text on dark
    } catch (e) {
        console.error("Error parsing HSL for contrast:", hslColor, e);
        return '#333333'; // Fallback to dark text
    }
}
// ---------------------------------------

/**
 * PinCard Component: Displays summary information for a single pin in the list
 * and provides actions (Edit, Delete).
 */
function PinCard({ pin, isActive, onClick, onEditRequest, onDeleteRequest }) {
    const theme = useTheme();

    const cardStyle = {
        mb: 1,
        backgroundColor: isActive ? theme.palette.action.hover : theme.palette.background.paper,
        borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : `4px solid transparent`,
        transition: 'background-color 0.2s ease, border-left 0.2s ease',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
         '&:hover': {
             backgroundColor: theme.palette.action.hover,
         },
         minWidth: '200px',
    };

    // Handler for the main content click (selection)
    const handleContentClick = (event) => {
        if (onClick) {
            onClick(pin.id); // Pass only ID for selection
        }
    };

    // Handler for the Edit button click
    const handleEditClick = (event) => {
        event.stopPropagation(); // Prevent the main onClick from firing
        if (onEditRequest) {
            onEditRequest(pin); // Pass the full pin object for editing
        }
    };

    // Handler for the Delete button click
    const handleDeleteClick = (event) => {
        event.stopPropagation(); // Prevent the main onClick from firing
        if (onDeleteRequest) {
            onDeleteRequest(pin.id); // Pass only the pin ID for deletion
        }
    };

    const tagsToDisplay = Array.isArray(pin.tags) ? pin.tags : [];
    const maxTagsToShow = 3; // Adjust how many tags to show before "+N"

    return (
        <Card sx={cardStyle} variant="outlined">
            {/* Main content area */}
            <Box
                onClick={handleContentClick}
                sx={{
                    flexGrow: 1,
                    cursor: 'pointer',
                    p: 1.5,
                    minWidth: 0, // Flexbox fix for potentially overflowing content
                }}
            >
                {/* Pin Title */}
                <Typography variant="subtitle1" component="div" fontWeight="medium" noWrap>
                    {pin.title || 'Untitled Pin'}
                </Typography>

                {/* --- TAGS SECTION --- */}
                {tagsToDisplay.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                        {tagsToDisplay.slice(0, maxTagsToShow).map(tag => {
                            const tagName = tag.name || 'untagged';
                            const bgColor = stringToHslColor(tagName);
                            const textColor = getContrastYIQ(bgColor);
                            return (
                                <Chip
                                    key={tag.id || tagName}
                                    label={tagName}
                                    size="small"
                                    // Use sx for styling
                                    sx={{
                                        backgroundColor: bgColor,
                                        color: textColor,
                                        height: '20px', // Smaller height
                                        fontSize: '0.75rem', // Smaller font
                                        lineHeight: '16px', // Adjust line height to vertically center
                                        borderRadius: '10px', // Make slightly more rounded
                                        '.MuiChip-label': { // Target label class for padding
                                             paddingLeft: '8px',
                                             paddingRight: '8px',
                                        }
                                    }}
                                />
                            );
                        })}
                        {/* Overflow (+N) Chip */}
                        {tagsToDisplay.length > maxTagsToShow && (
                            <Tooltip title={tagsToDisplay.slice(maxTagsToShow).map(t => t.name).join(', ')}>
                                <Chip
                                    label={`+${tagsToDisplay.length - maxTagsToShow}`}
                                    size="small"
                                    variant="outlined" // Keep outlined or style similarly
                                    sx={{
                                        color: 'text.secondary',
                                        borderColor: 'action.disabled',
                                        height: '20px', // Match height
                                        fontSize: '0.75rem', // Match font size
                                        lineHeight: '16px', // Match line height
                                        borderRadius: '10px', // Match rounding
                                         '.MuiChip-label': {
                                             paddingLeft: '6px', // Adjust padding for +N
                                             paddingRight: '6px',
                                        }
                                    }}
                                 />
                             </Tooltip>
                        )}
                    </Box>
                )}
                {/* --- END OF TAGS SECTION --- */}

                 {/* Pin Notes */}
                 {pin.notes && (
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.5 }}>
                        {pin.notes.split('\n')[0]}
                    </Typography>
                 )}
            </Box>

            {/* Action buttons area */}
            <CardActions
                sx={{
                    p: 0.5,
                    alignSelf: 'center',
                    flexShrink: 0, // Prevent actions from shrinking
                }}
            >
                 <Tooltip title="Edit Pin">
                    <IconButton onClick={handleEditClick} size="small" aria-label="Edit Pin">
                        <EditIcon fontSize="small" />
                    </IconButton>
                 </Tooltip>
                 <Tooltip title="Delete Pin">
                    <IconButton onClick={handleDeleteClick} size="small" color="error" aria-label="Delete Pin">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                 </Tooltip>
            </CardActions>
        </Card>
    );
}

export default PinCard;