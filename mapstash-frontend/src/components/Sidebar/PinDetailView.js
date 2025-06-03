import React from 'react';
import PropTypes from 'prop-types';

// --- MUI Imports ---
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip'; // Ensure Chip is imported
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';

// --- Icons ---
import CloseIcon from '@mui/icons-material/Close'; // Or ArrowBackIcon
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import NotesIcon from '@mui/icons-material/Notes';
import LabelIcon from '@mui/icons-material/Label';

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
 * PinDetailView Component: Displays read-only details of a selected pin.
 */
function PinDetailView({ pin, onClose, onEditRequest, onDeleteRequest }) {
    const theme = useTheme();

    // Handle cases where pin data might be missing initially
    if (!pin) {
        return (
            <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography color="text.secondary">No pin selected.</Typography>
            </Box>
        );
    }

    // Extract data safely with fallbacks
    const { id, title, notes, tags, latitude, longitude } = pin;
    const displayTitle = title || 'Untitled Pin';
    const displayNotes = notes || 'No notes added.';
    const displayTags = Array.isArray(tags) ? tags : [];
    const displayLatitude = latitude?.toFixed(6) || 'N/A';
    const displayLongitude = longitude?.toFixed(6) || 'N/A';


    const handleEdit = () => {
        if (onEditRequest) {
            onEditRequest(pin); // Pass the full pin object
        }
    };

    const handleDelete = () => {
        if (onDeleteRequest) {
            onDeleteRequest(id); // Pass only the ID
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

            {/* --- Header --- */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 1,
                    px: 2,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    flexShrink: 0, // Prevent header from shrinking
                }}
            >
                {/* Close/Back Button */}
                <Tooltip title="Back to List">
                    <IconButton onClick={onClose} size="small" aria-label="Back to list">
                        <CloseIcon />
                    </IconButton>
                </Tooltip>

                <Typography variant="h6" component="div" noWrap sx={{ flexGrow: 1, textAlign: 'center', mx: 1 }}>
                    Details
                </Typography>

                {/* Action Buttons */}
                <Box>
                     <Tooltip title="Edit Pin">
                        <IconButton onClick={handleEdit} size="small" aria-label="Edit pin">
                            <EditIcon />
                        </IconButton>
                     </Tooltip>
                     <Tooltip title="Delete Pin">
                        <IconButton onClick={handleDelete} size="small" color="error" aria-label="Delete pin">
                            <DeleteIcon />
                        </IconButton>
                     </Tooltip>
                </Box>
            </Box>

            {/* --- Scrollable Content Area --- */}
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>

                {/* Title */}
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'medium' }}>
                    {displayTitle}
                </Typography>

                <Divider sx={{ my: 2 }} />

                {/* --- TAGS SECTION --- */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                   <LabelIcon color="action" sx={{ mr: 1 }} />
                   <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Tags</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1, mb: 2, pl: 4 /* Indent tags */ }}>
                    {displayTags.length > 0 ? (
                        displayTags.map(tag => {
                            const tagName = tag.name || 'untagged';
                            const bgColor = stringToHslColor(tagName);
                            const textColor = getContrastYIQ(bgColor);
                            return (
                                <Chip
                                    key={tag.id || tagName}
                                    label={tagName}
                                    // Use sx for styling
                                    sx={{
                                        backgroundColor: bgColor,
                                        color: textColor,
                                        // Default small chip size is usually fine here
                                    }}
                                />
                            );
                        })
                    ) : (
                        <Typography variant="body2" color="text.secondary">No tags.</Typography>
                    )}
                </Box>
                {/* --- END OF TAGS SECTION --- */}

                {/* Notes Section */}
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, mt: 2 }}>
                   <NotesIcon color="action" sx={{ mr: 1 }} />
                   <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Notes</Typography>
                </Box>
                <Typography
                    variant="body1"
                    component="pre" // Use <pre> for whitespace consistency
                    sx={{
                        mt: 1,
                        mb: 2,
                        whiteSpace: 'pre-wrap', // Respect newlines and spaces
                        wordBreak: 'break-word', // Prevent long words from overflowing
                        color: notes ? 'text.primary' : 'text.secondary', // Dim if no notes
                        pl: 4 /* Indent notes */
                    }}
                >
                    {displayNotes}
                </Typography>

                {/* Coordinates Section */}
                 <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, mt: 2 }}>
                    <LocationOnIcon color="action" sx={{ mr: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>Location</Typography>
                 </Box>
                 <Typography variant="body2" color="text.secondary" sx={{ pl: 4 }}>
                    Lat: {displayLatitude}, Lng: {displayLongitude}
                 </Typography>

            </Box>
        </Box>
    );
}

// Define PropTypes for better component usage understanding and validation
PinDetailView.propTypes = {
  pin: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string,
    notes: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string
    })),
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }), // Allow pin to be null initially
  onClose: PropTypes.func.isRequired,
  onEditRequest: PropTypes.func.isRequired,
  onDeleteRequest: PropTypes.func.isRequired,
};

export default PinDetailView;