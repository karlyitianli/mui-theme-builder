import { useMemo, useState } from 'react';
import { Box, InputBase, Stack, Typography } from '@mui/material';

import type { PreviewMode } from '../../state/editor-state.types';
import { filterMuiPalette } from './mui-palette';
import { shellBorderForMode } from './shell-border';

// The MUI palette browser (task 3.3), rendered inside the ColorPicker
// popover under its "MUI palette" toggle: a search field over the
// official @mui/material/colors tokens (see mui-palette.ts), grouped
// by family, one button per swatch showing the token name, its hex,
// and the color itself. Picking a swatch hands the hex to the picker,
// which commits it through the row's usual action, so a pick is one
// undoable edit and pins a semantic variant exactly like a typed hex.
//
// The browser is builder chrome: it renders in the shell theme, and
// only the picked hex enters the edited theme.

interface PaletteBrowserProps {
  label: string;
  mode: PreviewMode;
  onPick: (hex: string) => void;
}

export function PaletteBrowser({ label, mode, onPick }: PaletteBrowserProps) {
  const [query, setQuery] = useState('');
  const families = useMemo(() => filterMuiPalette(query), [query]);

  return (
    <Box sx={{ mt: 1.5 }}>
      <Box
        sx={{
          alignItems: 'center',
          border: shellBorderForMode(mode),
          borderRadius: '6px',
          display: 'flex',
          height: 36,
          px: 1,
        }}
      >
        <InputBase
          autoFocus
          fullWidth
          inputProps={{ 'aria-label': `Search MUI palette for ${label}` }}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, shade, or hex"
          sx={{ fontSize: 14, lineHeight: '20px' }}
          value={query}
        />
      </Box>
      <Box
        data-testid="mui-palette-list"
        sx={{ maxHeight: 264, mt: 1, overflowY: 'auto', pr: 0.5 }}
      >
        {families.length === 0 && (
          <Typography sx={{ color: 'text.secondary', fontSize: 13, py: 1 }}>
            No MUI colors match that search.
          </Typography>
        )}
        <Stack spacing={1.5}>
          {families.map((family) => (
            <Box key={family.name}>
              <Typography
                sx={{
                  color: 'text.secondary',
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  lineHeight: '16px',
                  textTransform: 'uppercase',
                }}
              >
                {family.name}
              </Typography>
              <Stack spacing={0.25} sx={{ mt: 0.5 }}>
                {family.swatches.map((swatch) => (
                  <Box
                    aria-label={`${swatch.name} ${swatch.hex}`}
                    component="button"
                    key={swatch.name}
                    onClick={() => onPick(swatch.hex)}
                    sx={{
                      alignItems: 'center',
                      background: 'none',
                      border: 'none',
                      borderRadius: '6px',
                      color: 'inherit',
                      cursor: 'pointer',
                      display: 'flex',
                      font: 'inherit',
                      p: 0.5,
                      textAlign: 'left',
                      width: '100%',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    title={`${swatch.name} ${swatch.hex}`}
                    type="button"
                  >
                    <Box
                      sx={{
                        bgcolor: swatch.hex,
                        border: shellBorderForMode(mode),
                        borderRadius: '4px',
                        flexShrink: 0,
                        height: 20,
                        width: 20,
                      }}
                    />
                    <Typography sx={{ fontSize: 13, lineHeight: '18px', ml: 1 }}>
                      {swatch.name}
                    </Typography>
                    <Typography
                      sx={{ color: 'text.secondary', fontSize: 13, lineHeight: '18px', ml: 'auto' }}
                    >
                      {swatch.hex}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
