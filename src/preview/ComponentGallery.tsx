import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

export function ComponentGallery() {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography component="h2" variant="h5">
          Component preview
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Button, TextField, and Select inherit the active theme.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
        <Button>Theme default</Button>
        <Button variant="contained">Contained</Button>
        <Button variant="outlined">Outlined</Button>
        <Button variant="text">Text</Button>
        <Button disabled variant="contained">
          Disabled
        </Button>
      </Stack>

      <TextField fullWidth label="Project name" defaultValue="Customer portal" />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField error helperText="Example error" label="Error state" defaultValue="Invalid value" />
        <TextField disabled label="Disabled state" defaultValue="Unavailable" />
      </Stack>

      <FormControl fullWidth>
        <InputLabel id="preview-select-label">Density</InputLabel>
        <Select defaultValue="comfortable" label="Density" labelId="preview-select-label">
          <MenuItem value="compact">Compact</MenuItem>
          <MenuItem value="comfortable">Comfortable</MenuItem>
          <MenuItem value="spacious">Spacious</MenuItem>
        </Select>
      </FormControl>
      <FormControl disabled fullWidth>
        <InputLabel id="preview-disabled-select-label">Disabled select</InputLabel>
        <Select defaultValue="comfortable" label="Disabled select" labelId="preview-disabled-select-label">
          <MenuItem value="comfortable">Comfortable</MenuItem>
        </Select>
      </FormControl>
    </Stack>
  );
}
