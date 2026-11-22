import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';
import { Alert, Button, Stack } from '@mui/material';

interface PreviewBoundaryProps {
  children: ReactNode;
}

interface PreviewBoundaryState {
  hasError: boolean;
}

export class PreviewBoundary extends Component<PreviewBoundaryProps, PreviewBoundaryState> {
  state: PreviewBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PreviewBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Theme preview failed to render.', error, info);
  }

  private retry = () => this.setState({ hasError: false });

  render() {
    if (this.state.hasError) {
      return (
        <Stack spacing={2} sx={{ p: 3 }}>
          <Alert severity="error">The theme preview could not be rendered.</Alert>
          <Button onClick={this.retry} variant="outlined">
            Try preview again
          </Button>
        </Stack>
      );
    }

    return this.props.children;
  }
}
