import { useMemo, useState } from 'react';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { CopyIcon } from '@phosphor-icons/react/dist/csr/Copy';
import { DownloadSimpleIcon } from '@phosphor-icons/react/dist/csr/DownloadSimple';
import {
  Alert,
  Box,
  Button,
  Drawer,
  IconButton,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';

import type { ThemeProject } from '../domain/project';
import { downloadTheme } from './download-theme';
import { emitFontSnippet } from './emit-font-snippet';
import { emitIntegrationSnippet } from './emit-integration-snippet';
import { emitThemeTsx } from './emit-theme-tsx';

type CodeTab = 'theme' | 'font' | 'integration';

export function GeneratedCodeDrawer({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project: ThemeProject;
}) {
  const [tab, setTab] = useState<CodeTab>('theme');
  const [message, setMessage] = useState<string>();
  const snippets = useMemo(
    () => ({
      theme: emitThemeTsx(project),
      font: emitFontSnippet(project),
      integration: emitIntegrationSnippet(),
    }),
    [project],
  );
  const code = snippets[tab];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setMessage('Copied to clipboard.');
    } catch {
      setMessage('Clipboard access failed. Select and copy the code manually.');
    }
  };

  return (
    <Drawer anchor="bottom" onClose={onClose} open={open}>
      <Box sx={{ height: 'min(78dvh, 760px)', display: 'flex', flexDirection: 'column' }}>
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, pt: 2 }}>
          <Typography component="h2" variant="h6">Export theme</Typography>
          <IconButton aria-label="Close generated code" onClick={onClose}><XIcon /></IconButton>
        </Stack>
        <Tabs onChange={(_, value: CodeTab) => { setTab(value); setMessage(undefined); }} value={tab} sx={{ px: 2 }}>
          <Tab label="theme.tsx" value="theme" />
          <Tab label="Install font" value="font" />
          <Tab label="Integration" value="integration" />
        </Tabs>
        <Stack direction="row" spacing={1} sx={{ px: 3, py: 2 }}>
          <Button onClick={copy} startIcon={<CopyIcon />} variant="outlined">Copy</Button>
          {tab === 'theme' && <Button onClick={() => downloadTheme(project)} startIcon={<DownloadSimpleIcon />} variant="contained">Download theme.tsx</Button>}
          {tab === 'theme' && (
            <Typography color="text.secondary" sx={{ alignSelf: 'center' }} variant="caption">
              Requires @phosphor-icons/react for the dropdown icon: npm install @phosphor-icons/react
            </Typography>
          )}
        </Stack>
        {message && <Alert severity={message.startsWith('Copied') ? 'success' : 'warning'} sx={{ mx: 3, mb: 1 }}>{message}</Alert>}
        <Box
          component="pre"
          tabIndex={0}
          sx={{ bgcolor: '#111318', color: '#e8e8e8', flex: 1, fontFamily: 'monospace', fontSize: 13, m: 0, overflow: 'auto', p: 3, whiteSpace: 'pre' }}
        >
          <code>{code}</code>
        </Box>
      </Box>
    </Drawer>
  );
}
