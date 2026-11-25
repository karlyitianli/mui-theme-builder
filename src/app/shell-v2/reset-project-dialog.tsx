import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

// The reset confirm for the v2 shell (Phase 4), mirroring the original
// toolbar's dialog word for word. Shown by useProjectReset's callers when
// a reset or preset change would bury edits; see use-project-reset.ts.
interface ResetProjectDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
  open: boolean;
}

export function ResetProjectDialog({ onCancel, onConfirm, open }: ResetProjectDialogProps) {
  return (
    <Dialog onClose={onCancel} open={open}>
      <DialogTitle>Reset the entire theme?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This returns both color schemes and every component to MUI defaults. You can undo the
          reset afterward.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button color="error" onClick={onConfirm}>
          Reset theme
        </Button>
      </DialogActions>
    </Dialog>
  );
}
