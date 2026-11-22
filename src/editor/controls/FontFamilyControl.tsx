import { Autocomplete, TextField } from '@mui/material';

import { googleFontCatalog, type GoogleFontCatalogEntry } from '../../fonts/catalog';

export function FontFamilyControl({
  value,
  onChange,
}: {
  value?: GoogleFontCatalogEntry;
  onChange: (font: GoogleFontCatalogEntry) => void;
}) {
  return (
    <Autocomplete
      disableClearable
      getOptionLabel={(option) => option.family}
      onChange={(_, font) => onChange(font)}
      options={googleFontCatalog}
      renderInput={(params) => <TextField {...params} label="Google Font" />}
      value={value ?? googleFontCatalog[0]}
    />
  );
}
