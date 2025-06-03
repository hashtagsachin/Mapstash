import React, { useState, useEffect } from 'react';
// MUI Imports
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Autocomplete from '@mui/material/Autocomplete';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip'; // <<< Import Tooltip

/**
 * PinForm Component: Renders the form for adding or editing pins.
 * Includes basic client-side validation feedback.
 * @param {object} props - Component props.
 * @param {string} props.mode - 'add' or 'edit'.
 * @param {object|null} props.initialData - Pin data or coords for populating the form.
 * @param {function} props.onSave - Callback when form is submitted *after validation*. Receives form data.
 * @param {function} props.onCancel - Callback when cancel button is clicked.
 * @param {Array<string>} props.availableTags - List of existing tag names for Autocomplete suggestions.
 * @param {boolean} props.isSaving - Indicates if a save operation is in progress.
 */
function PinForm({
    mode = 'add',
    initialData = null,
    onSave,
    onCancel,
    availableTags = [],
    isSaving = false
}) {

  // --- State ---
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  // NEW: State to hold validation errors
  const [formErrors, setFormErrors] = useState({ title: '' }); // Initialize for fields we validate

  // --- Populate Form Effect ---
  useEffect(() => {
    let defaultTitle = '';
    let defaultNotes = '';
    let defaultTags = [];

    if (initialData) {
        if (mode === 'edit') {
            defaultTitle = initialData.title || '';
            defaultNotes = initialData.notes || '';
            defaultTags = Array.isArray(initialData.tags) ? initialData.tags : [];
        }
        // Add mode only resets, coords are displayed below from initialData
    }
    setTitle(defaultTitle);
    setNotes(defaultNotes);
    setSelectedTags(defaultTags);
    setFormErrors({ title: '' }); // Reset errors when data/mode changes

  }, [initialData, mode]);

  // --- Validation --- <<< NEW Function
  const validateForm = () => {
    let errors = { title: '' };
    let isValid = true;

    if (!title.trim()) {
      errors.title = 'Title is required and cannot be empty.';
      isValid = false;
    }
    // Add more validation rules here if needed (e.g., max length)

    setFormErrors(errors); // Update error state
    return isValid; // Return true if form is valid
  };

  // --- Handlers ---
  const handleTitleChange = (event) => {
    setTitle(event.target.value);
    // Optionally clear error on change
    if (formErrors.title && event.target.value.trim()) {
      setFormErrors({ ...formErrors, title: '' });
    }
  };
  const handleNotesChange = (event) => setNotes(event.target.value);
  const handleTagsChange = (event, newValue) => {
     const uniqueTags = [...new Set(
         newValue.map(tag => (typeof tag === 'string' ? tag.trim() : tag))
     )].filter(tag => tag && tag.length > 0);
     setSelectedTags(uniqueTags);
  };
  const handleCancel = () => { if (onCancel) onCancel(); };

  // --- Form Submission --- <<< MODIFIED to include validation
  const handleSubmit = (event) => {
    event.preventDefault();

    // Validate form before proceeding
    if (!validateForm()) {
      console.log("Form validation failed.");
      return; // Stop submission if invalid
    }

    // Prepare data (tags are already clean in state)
    const formData = {
      title: title.trim(), // Ensure trimmed title is saved
      notes: notes.trim(), // Ensure trimmed notes are saved
      tags: selectedTags,
    };

    const saveData = mode === 'edit'
      ? { ...formData, id: initialData?.id }
      : { ...formData, lat: initialData?.lat, lng: initialData?.lng };

    console.log("Form validated, submitting:", saveData);
    if (onSave) {
      onSave(saveData); // Call parent save handler
    }
  };

  // --- Render ---
  return (
    <Box component="form" sx={{ padding: 2 }} onSubmit={handleSubmit} noValidate>
      <Typography variant="h6" gutterBottom>
        {mode === 'add' ? 'Add New Pin' : `Edit Pin`}
      </Typography>

      {/* Title TextField with Validation Feedback */}
      <TextField
        label="Title"
        variant="outlined"
        fullWidth
        required
        margin="normal"
        value={title}
        onChange={handleTitleChange}
        disabled={isSaving}
        error={!!formErrors.title} // Show error state if formErrors.title is not empty
        helperText={formErrors.title || ''} // Display error message from state
        InputLabelProps={{ shrink: true }} // Ensure label is always shrunk if value exists
      />

      {/* Notes TextField */}
      <TextField
        label="Notes"
        variant="outlined"
        fullWidth
        multiline
        rows={4}
        margin="normal"
        value={notes}
        onChange={handleNotesChange}
        disabled={isSaving}
        InputLabelProps={{ shrink: true }} // Ensure label is always shrunk if value exists
      />

      {/* Tags Autocomplete */}
      <Autocomplete
        multiple
        freeSolo
        options={availableTags}
        value={selectedTags}
        onChange={handleTagsChange} // Use defined handler
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
                key={option + '-' + index} // More robust key if tags can be duplicated temporarily
                variant="outlined"
                label={option}
                {...getTagProps({ index })}
                disabled={isSaving}
            />
          ))
        }
        renderInput={(params) => (
          <TextField
            {...params}
            variant="outlined"
            label="Tags"
            placeholder="Add or select tags"
            margin="normal"
            disabled={isSaving}
            helperText="Type & press Enter, or select suggestions."
          />
        )}
        disabled={isSaving}
        onKeyDown={(event) => {
          // Prevent accidental form submit on Enter within Autocomplete
          if (event.key === 'Enter') {
             event.stopPropagation(); // Stop event bubbling up to form
             // Optionally add the current input value as a tag if using freeSolo extensively
          }
        }}
      />

      {/* Display Coordinates */}
      <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, mb: 1 }}>
         {mode === 'add' && initialData?.lat && `Coords: ${initialData.lat?.toFixed(6)}, ${initialData.lng?.toFixed(6)}`}
         {mode === 'edit' && initialData?.latitude && `Coords: ${initialData.latitude?.toFixed(6)}, ${initialData.longitude?.toFixed(6)}`}
      </Typography>

      {/* Action Buttons with Tooltips */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Tooltip title="Discard changes and close">
          {/* Span needed for tooltip when button is disabled */}
          <span>
             <Button variant="outlined" onClick={handleCancel} disabled={isSaving}>
               Cancel
             </Button>
          </span>
        </Tooltip>
        <Tooltip title={!title.trim() ? "Title is required" : (mode === 'add' ? "Save new pin" : "Save changes")}>
          {/* Span needed for tooltip when button is disabled */}
          <span>
             <Button
               type="submit"
               variant="contained"
               disabled={isSaving || !title.trim()} // Disable if saving or title empty
               startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}
             >
               {isSaving ? 'Saving...' : (mode === 'add' ? 'Save Pin' : 'Save Changes')}
             </Button>
          </span>
        </Tooltip>
      </Box>
    </Box>
  );
}

export default PinForm;