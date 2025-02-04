import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

/**
 * A fallback component that renders when the user has no design files.
 */
export function NoFiles() {
  return (
    <Box sx={{ textAlign: 'center', marginTop: 4, marginBottom: 4 }}>
      <Typography variant="h6">No designs found.</Typography>
      <Typography variant="body1">Start by creating a new design!</Typography>
    </Box>
  );
}
