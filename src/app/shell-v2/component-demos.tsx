import { useEffect, useState, type ComponentProps, type ReactNode, type SyntheticEvent } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AppBar,
  Autocomplete,
  Avatar,
  AvatarGroup,
  Backdrop,
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  CardMedia,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  Fab,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  IconButton,
  LinearProgress,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Pagination,
  Radio,
  RadioGroup,
  Rating,
  Skeleton,
  Slider,
  Snackbar,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Switch,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Toolbar,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { type SxProps, type Theme } from '@mui/material/styles';
import { BellIcon } from '@phosphor-icons/react/dist/csr/Bell';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { CheckCircleIcon } from '@phosphor-icons/react/dist/csr/CheckCircle';
import { ClockCounterClockwiseIcon } from '@phosphor-icons/react/dist/csr/ClockCounterClockwise';
import { CopyIcon } from '@phosphor-icons/react/dist/csr/Copy';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/csr/DotsThreeVertical';
import { FileIcon } from '@phosphor-icons/react/dist/csr/File';
import { FloppyDiskIcon } from '@phosphor-icons/react/dist/csr/FloppyDisk';
import { FolderIcon } from '@phosphor-icons/react/dist/csr/Folder';
import { HeartIcon } from '@phosphor-icons/react/dist/csr/Heart';
import { HouseIcon } from '@phosphor-icons/react/dist/csr/House';
import { InfoIcon } from '@phosphor-icons/react/dist/csr/Info';
import { ListIcon } from '@phosphor-icons/react/dist/csr/List';
import { MapPinIcon } from '@phosphor-icons/react/dist/csr/MapPin';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { PrinterIcon } from '@phosphor-icons/react/dist/csr/Printer';
import { ShareNetworkIcon } from '@phosphor-icons/react/dist/csr/ShareNetwork';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { TrayIcon } from '@phosphor-icons/react/dist/csr/Tray';
import { WarningIcon } from '@phosphor-icons/react/dist/csr/Warning';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';
import { XCircleIcon } from '@phosphor-icons/react/dist/csr/XCircle';

// Demo components for the preview registry's cards (see
// component-registry.tsx). Each demo owns its interaction state
// locally; nothing here touches the editor state or the project.
// These live in their own module because component-registry.tsx also
// exports data and helpers, and the react-refresh lint rule only
// allows component exports alongside other components.

export function AutocompleteDemo() {
  return (
    <>
      <Typography sx={{ mb: 1 }} variant="body1">
        Label
      </Typography>
      <Autocomplete
        options={['Option 1', 'Option 2', 'Option 3']}
        renderInput={(params) => <TextField {...params} placeholder="Placeholder" />}
      />
    </>
  );
}

export function ButtonGroupDemo() {
  return (
    <ButtonGroup variant="contained">
      <Button>One</Button>
      <Button>Two</Button>
      <Button>Three</Button>
    </ButtonGroup>
  );
}

export function CheckboxDemo() {
  const [checked, setChecked] = useState(true);
  const [unchecked, setUnchecked] = useState(false);
  const [indeterminateChecked, setIndeterminateChecked] = useState(false);
  return (
    <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
          />
        }
        label="Checked"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={unchecked}
            onChange={(event) => setUnchecked(event.target.checked)}
          />
        }
        label="Unchecked"
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={indeterminateChecked}
            indeterminate={!indeterminateChecked}
            onChange={(event) => setIndeterminateChecked(event.target.checked)}
          />
        }
        label="Indeterminate"
      />
    </Stack>
  );
}

export function FabDemo() {
  return (
    <Fab aria-label="Add" color="primary">
      <PlusIcon size={20} />
    </Fab>
  );
}

export function RadioGroupDemo() {
  const [value, setValue] = useState('One');
  return (
    <FormControl>
      <FormLabel>Label</FormLabel>
      <RadioGroup
        onChange={(event) => setValue(event.target.value)}
        row
        value={value}
      >
        {['One', 'Two', 'Three'].map((option) => (
          <FormControlLabel
            control={<Radio />}
            key={option}
            label={option}
            value={option}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
}

export function RatingDemo() {
  const [value, setValue] = useState<number | null>(4);
  return (
    <>
      <Typography sx={{ mb: 1 }} variant="body1">
        Label
      </Typography>
      <Rating onChange={(_, newValue) => setValue(newValue)} value={value} />
    </>
  );
}

export function SliderDemo() {
  const [value, setValue] = useState(30);
  return (
    <Slider
      aria-label="Slider"
      onChange={(_, newValue) =>
        setValue(Array.isArray(newValue) ? newValue[0] : newValue)
      }
      value={value}
    />
  );
}

export function SwitchDemo() {
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);
  return (
    <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
      <FormControlLabel
        control={
          <Switch checked={on} onChange={(event) => setOn(event.target.checked)} />
        }
        label="On"
      />
      <FormControlLabel
        control={
          <Switch checked={off} onChange={(event) => setOff(event.target.checked)} />
        }
        label="Off"
      />
    </Stack>
  );
}

export function ToggleButtonDemo() {
  const [alignment, setAlignment] = useState('left');
  return (
    <ToggleButtonGroup
      exclusive
      onChange={(_, newAlignment) => {
        if (newAlignment !== null) setAlignment(newAlignment);
      }}
      value={alignment}
    >
      <ToggleButton value="left">Left</ToggleButton>
      <ToggleButton value="center">Center</ToggleButton>
      <ToggleButton value="right">Right</ToggleButton>
    </ToggleButtonGroup>
  );
}

// Data Display demos, in the same style as the Inputs demos above:
// canonical variants per component, interaction state local to the
// card where the component has a meaningful interaction.

export function AvatarDemo() {
  return (
    <Stack spacing={1.5}>
      <AvatarGroup max={4}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>K</Avatar>
        <Avatar sx={{ bgcolor: 'secondary.main' }}>R</Avatar>
        <Avatar sx={{ bgcolor: 'error.main' }}>P</Avatar>
        <Avatar sx={{ bgcolor: 'success.main' }}>D</Avatar>
        <Avatar sx={{ bgcolor: 'info.main' }}>S</Avatar>
      </AvatarGroup>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Avatar>K</Avatar>
        <Avatar variant="rounded">R</Avatar>
        <Avatar variant="square">P</Avatar>
      </Stack>
    </Stack>
  );
}

export function BadgeDemo() {
  return (
    <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
      <Badge badgeContent={4} color="primary">
        <BellIcon size={24} />
      </Badge>
      <Badge color="error" variant="dot">
        <BellIcon size={24} />
      </Badge>
      <Badge badgeContent={100} color="secondary" max={99}>
        <BellIcon size={24} />
      </Badge>
    </Stack>
  );
}

export function ChipDemo() {
  const [deletable, setDeletable] = useState([
    { key: 0, label: 'Deletable' },
    { key: 1, label: 'Removable' },
  ]);
  const [selected, setSelected] = useState(false);
  return (
    <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
      <Chip label="Filled" />
      <Chip label="Outlined" variant="outlined" />
      <Chip
        color={selected ? 'primary' : 'default'}
        label="Clickable"
        onClick={() => setSelected((current) => !current)}
      />
      {deletable.map((chip) => (
        <Chip
          // Karl (Nov 25, 2026): the delete glyph is the Phosphor X,
          // at 22px, the size MUI's own delete icon rendered at (the
          // Chip deleteIcon styles set fontSize 22 on the glyph).
          deleteIcon={<XIcon size={22} />}
          key={chip.key}
          label={chip.label}
          onDelete={() =>
            setDeletable((current) =>
              current.filter((candidate) => candidate.key !== chip.key),
            )
          }
        />
      ))}
    </Stack>
  );
}

export function DividerDemo() {
  return (
    <Stack spacing={1.5}>
      <Typography variant="body2">Above the divider</Typography>
      <Divider />
      <Typography variant="body2">Below the divider</Typography>
      <Divider>Center</Divider>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Typography variant="body2">Left</Typography>
        <Divider flexItem orientation="vertical" />
        <Typography variant="body2">Right</Typography>
      </Stack>
    </Stack>
  );
}

export function ListDemo() {
  const [selected, setSelected] = useState(0);
  const items = [
    { icon: <TrayIcon size={20} />, label: 'Inbox', secondary: '3 unread' },
    { icon: <PaperPlaneTiltIcon size={20} />, label: 'Sent', secondary: undefined },
    { icon: <FileIcon size={20} />, label: 'Drafts', secondary: '2 saved' },
  ];
  return (
    <List dense disablePadding>
      {items.map((item, index) => (
        <ListItemButton
          key={item.label}
          onClick={() => setSelected(index)}
          selected={selected === index}
        >
          <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} secondary={item.secondary} />
        </ListItemButton>
      ))}
    </List>
  );
}

export function TableDemo() {
  const rows = [
    { name: 'Frozen yoghurt', calories: 159, fat: 6.0, carbs: 24 },
    { name: 'Ice cream sandwich', calories: 237, fat: 9.0, carbs: 37 },
    { name: 'Eclair', calories: 262, fat: 16.0, carbs: 24 },
    { name: 'Cupcake', calories: 305, fat: 3.7, carbs: 67 },
  ];
  return (
    <TableContainer>
      <Table aria-label="Dessert nutrition" size="small">
        <TableHead>
          <TableRow>
            <TableCell>Dessert (100g serving)</TableCell>
            <TableCell align="right">Calories</TableCell>
            <TableCell align="right">Fat (g)</TableCell>
            <TableCell align="right">Carbs (g)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.name}>
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>
              <TableCell align="right">{row.carbs}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export function TooltipDemo() {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Tooltip title="Delete">
        <IconButton aria-label="Delete">
          <TrashIcon size={20} />
        </IconButton>
      </Tooltip>
      <Tooltip arrow placement="bottom" title="Arrow tooltip">
        <Button variant="outlined">Hover me</Button>
      </Tooltip>
    </Stack>
  );
}

// Feedback demos, in the same style as the categories above:
// canonical variants per component, interaction state local to the
// card where the component has a meaningful interaction.
//
// Backdrop, Dialog, and Snackbar are overlays. Each demo opens the
// real component from a button, contained in a fixed-height stage
// inside its card so the overlay covers the stage, never the whole
// app. Backdrop renders inline in this MUI version (it is a plain
// fixed-position div, no portal), so an absolute position scopes it
// to the stage. Dialog portals by design, so its container prop is
// pointed at the stage element: the modal is appended into the
// stage, its absolute root fills the stage, and the modal manager's
// aria-hiding stays inside the stage too. Snackbar renders in place
// and is absolutely positioned in the stage the same way. All three
// still sit in the card's React tree, so they render under the
// card's preview theme like everything else here.

function OverlayStage({
  children,
  stageRef,
}: {
  children: ReactNode;
  stageRef?: (element: HTMLDivElement | null) => void;
}) {
  return (
    <Box
      ref={stageRef}
      sx={{
        alignItems: 'center',
        bgcolor: 'action.hover',
        borderRadius: 1,
        display: 'flex',
        height: 176,
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {children}
    </Box>
  );
}

// Karl (Nov 25, 2026): in dark mode the overlay demos' trigger
// buttons are hard to see, because the outlined button's background
// is the paper color, which on the demos' dark stage reads as
// near-black on near-black. In dark mode only, the three trigger
// buttons (Show backdrop, Open dialog, Open snackbar) render white
// with dark text so they read clearly against the stage; light mode
// keeps the outlined default untouched. The gate is the theme's
// applyStyles, which keys off the same data attribute that flips
// the preview's color scheme. (The preview theme's JS palette
// cannot report the scheme on screen: every value is a CSS
// variable, so palette.mode stays on the base scheme.) The text
// color references the background variable, so it tracks the
// scheme's page color (near-black in the default dark scheme).
// Presentation only: no theme default changes.
const stageTriggerSx: SxProps<Theme> = (theme) =>
  theme.applyStyles('dark', {
    backgroundColor: '#fff',
    borderColor: '#fff',
    color: 'var(--mui-palette-background-default)',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.85)',
      borderColor: 'rgba(255, 255, 255, 0.85)',
      color: 'var(--mui-palette-background-default)',
    },
  });

// Karl (Nov 25, 2026): the Alert demo's icons are Phosphor, not MUI.
// Each severity maps to its Phosphor counterpart at 22px, the size
// MUI's own severity glyphs rendered at (the Alert icon slot sets
// fontSize 22 and MUI's default mapping icons inherit it). Phosphor
// glyphs fill with currentColor, so MUI's per-severity icon coloring
// keeps working unchanged.
const ALERT_ICON_MAPPING = {
  error: <XCircleIcon size={22} />,
  info: <InfoIcon size={22} />,
  success: <CheckCircleIcon size={22} />,
  warning: <WarningIcon size={22} />,
};

// The Alert close icon as a component for MUI v9's closeIcon slot,
// which renders its icon with SvgIcon-shaped props. Following the
// DropdownIcon pattern: every prop forwards to the glyph and only
// the size is pinned, 20px, the size MUI's small close glyph
// rendered at.
function AlertCloseIcon(props: ComponentProps<typeof XIcon>) {
  return <XIcon {...props} size={20} />;
}

export function AlertDemo() {
  const [successOpen, setSuccessOpen] = useState(true);
  return (
    <Stack spacing={1.5}>
      <Alert iconMapping={ALERT_ICON_MAPPING} severity="error">
        This is an error Alert.
      </Alert>
      <Alert iconMapping={ALERT_ICON_MAPPING} severity="warning">
        This is a warning Alert.
      </Alert>
      <Alert iconMapping={ALERT_ICON_MAPPING} severity="info">
        This is an info Alert.
      </Alert>
      {successOpen && (
        <Alert
          iconMapping={ALERT_ICON_MAPPING}
          onClose={() => setSuccessOpen(false)}
          severity="success"
          slots={{ closeIcon: AlertCloseIcon }}
        >
          This is a success Alert.
        </Alert>
      )}
    </Stack>
  );
}

export function BackdropDemo() {
  const [open, setOpen] = useState(false);
  return (
    <OverlayStage>
      <Button onClick={() => setOpen(true)} sx={stageTriggerSx} variant="outlined">
        Show backdrop
      </Button>
      <Backdrop
        onClick={() => setOpen(false)}
        open={open}
        sx={{ position: 'absolute', zIndex: 1 }}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </OverlayStage>
  );
}

export function DialogDemo() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const close = () => setOpen(false);
  return (
    <OverlayStage stageRef={setStage}>
      <Button onClick={() => setOpen(true)} sx={stageTriggerSx} variant="outlined">
        Open dialog
      </Button>
      <Dialog
        container={stage ?? undefined}
        onClose={close}
        open={open}
        slotProps={{
          paper: { sx: { m: 1, maxHeight: 'calc(100% - 16px)' } },
        }}
        sx={{ position: 'absolute' }}
      >
        <DialogTitle>Dialog title</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This dialog is contained in its preview card.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={close}>Cancel</Button>
          <Button onClick={close}>OK</Button>
        </DialogActions>
      </Dialog>
    </OverlayStage>
  );
}

export function ProgressDemo() {
  const [progress, setProgress] = useState(0);

  // The determinate indicators advance on a timer, the MUI docs
  // pattern; the interval is local to the card and cleared on
  // unmount.
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((previous) => (previous >= 100 ? 0 : previous + 10));
    }, 800);
    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={2.5} sx={{ alignItems: 'center' }}>
        <CircularProgress aria-label="Circular progress, indeterminate" />
        <Box sx={{ display: 'inline-flex', position: 'relative' }}>
          <CircularProgress
            aria-label="Circular progress, determinate"
            value={progress}
            variant="determinate"
          />
          <Box
            sx={{
              alignItems: 'center',
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              left: 0,
              position: 'absolute',
              right: 0,
              top: 0,
            }}
          >
            <Typography color="text.secondary" variant="caption">
              {`${Math.round(progress)}%`}
            </Typography>
          </Box>
        </Box>
        <CircularProgress aria-label="Circular progress, secondary" color="secondary" />
      </Stack>
      <LinearProgress aria-label="Linear progress, indeterminate" />
      <LinearProgress
        aria-label="Linear progress, determinate"
        value={progress}
        variant="determinate"
      />
    </Stack>
  );
}

export function SkeletonDemo() {
  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Skeleton height={40} variant="circular" width={40} />
        <Skeleton sx={{ flex: 1 }} variant="text" />
      </Stack>
      <Skeleton variant="text" />
      <Skeleton height={56} variant="rectangular" />
      <Skeleton animation="wave" height={40} variant="rounded" />
    </Stack>
  );
}

export function SnackbarDemo() {
  const [open, setOpen] = useState(false);
  return (
    <OverlayStage>
      <Button onClick={() => setOpen(true)} sx={stageTriggerSx} variant="outlined">
        Open snackbar
      </Button>
      <Snackbar
        action={
          <>
            <Button color="secondary" onClick={() => setOpen(false)} size="small">
              Undo
            </Button>
            <IconButton
              aria-label="Close"
              color="inherit"
              onClick={() => setOpen(false)}
              size="small"
            >
              <XIcon size={18} />
            </IconButton>
          </>
        }
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
        autoHideDuration={6000}
        message="Note archived"
        onClose={(_, reason) => {
          if (reason !== 'clickaway') setOpen(false);
        }}
        open={open}
        sx={{ position: 'absolute' }}
      />
    </OverlayStage>
  );
}

// Surfaces demos, in the same style as the categories above:
// canonical variants per component, interaction state local to the
// card where the component has a meaningful interaction.

export function AccordionDemo() {
  const [expanded, setExpanded] = useState<string | false>('panel1');
  const panels = [
    { body: 'First panel body text.', id: 'panel1', title: 'Accordion 1' },
    { body: 'Second panel body text.', id: 'panel2', title: 'Accordion 2' },
    { body: 'Third panel body text.', id: 'panel3', title: 'Accordion 3' },
  ];
  return (
    <Box>
      {panels.map((panel) => (
        <Accordion
          expanded={expanded === panel.id}
          key={panel.id}
          onChange={(_, isExpanded) => setExpanded(isExpanded ? panel.id : false)}
        >
          <AccordionSummary expandIcon={<CaretDownIcon size={20} />}>
            <Typography>{panel.title}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">{panel.body}</Typography>
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
}

// App Bar is a full-width top bar by nature; the demo renders it
// position="static" at the card's width, a contained sample bar
// (the MUI docs' menu, title, and login pattern), not a bar fixed
// across the app.
export function AppBarDemo() {
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          aria-label="Open menu"
          color="inherit"
          edge="start"
          sx={{ mr: 1 }}
        >
          <ListIcon size={20} />
        </IconButton>
        <Typography component="div" sx={{ flexGrow: 1 }} variant="h6">
          News
        </Typography>
        <Button color="inherit">Login</Button>
      </Toolbar>
    </AppBar>
  );
}

// A composed Card (header, media, content, actions) rendered under
// the preview theme, nested inside the registry's own preview card
// chrome; the outlined variant keeps the two cards readable as
// separate surfaces. The app ships no photo assets, so the media is
// a themed gradient block (the real CardMedia component) rather
// than a photo. The favorite action carries local toggle state.
export function CardDemo() {
  const [liked, setLiked] = useState(false);
  return (
    <Card sx={{ maxWidth: 345 }} variant="outlined">
      <CardHeader
        action={
          <IconButton aria-label="More actions">
            <DotsThreeVerticalIcon size={20} />
          </IconButton>
        }
        avatar={<Avatar sx={{ bgcolor: 'secondary.main' }}>D</Avatar>}
        subheader="Design team"
        title="Project update"
      />
      <CardMedia
        component="div"
        sx={{
          background: (theme) =>
            `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          height: 120,
        }}
      />
      <CardContent>
        <Typography color="text.secondary" variant="body2">
          A composed card with a header, media, content, and actions, rendered
          with the preview theme.
        </Typography>
      </CardContent>
      <CardActions>
        <IconButton
          aria-label="Add to favorites"
          aria-pressed={liked}
          color={liked ? 'error' : 'default'}
          onClick={() => setLiked((current) => !current)}
        >
          <HeartIcon size={20} weight={liked ? 'fill' : 'regular'} />
        </IconButton>
        <IconButton aria-label="Share">
          <ShareNetworkIcon size={20} />
        </IconButton>
        <Button size="small">Learn more</Button>
      </CardActions>
    </Card>
  );
}

// Navigation demos, in the same style as the categories above:
// canonical variants per component, interaction state local to the
// card where the component has a meaningful interaction.
//
// Drawer and Menu are overlay components, contained in a stage in
// their card the way the Feedback overlays are. The Drawer is a
// modal whose root, backdrop, and paper are all fixed-position by
// default, so the demo points the modal's container at the stage
// and restyles all three as absolute: the drawer then slides in
// from the stage's left edge and its backdrop covers only the
// stage. The Menu's popover paper is positioned from its anchor's
// viewport rect inside a fixed modal root, so pointing the
// container at the stage is enough there: the menu opens under its
// anchor button in the card, with its DOM inside the stage. Both
// render under the card's preview theme like everything else here.

export function BottomNavigationDemo() {
  const [value, setValue] = useState('recents');
  return (
    <BottomNavigation
      onChange={(_, newValue) => setValue(newValue)}
      showLabels
      value={value}
    >
      <BottomNavigationAction
        icon={<ClockCounterClockwiseIcon size={20} />}
        label="Recents"
        value="recents"
      />
      <BottomNavigationAction
        icon={<HeartIcon size={20} />}
        label="Favorites"
        value="favorites"
      />
      <BottomNavigationAction
        icon={<MapPinIcon size={20} />}
        label="Nearby"
        value="nearby"
      />
      <BottomNavigationAction
        icon={<FolderIcon size={20} />}
        label="Folder"
        value="folder"
      />
    </BottomNavigation>
  );
}

export function BreadcrumbsDemo() {
  const handleClick = (event: SyntheticEvent) => {
    event.preventDefault();
  };
  return (
    <Breadcrumbs aria-label="Breadcrumb">
      <Link
        color="inherit"
        href="#"
        onClick={handleClick}
        sx={{ alignItems: 'center', display: 'flex', gap: 0.5 }}
        underline="hover"
      >
        <HouseIcon size={16} />
        Home
      </Link>
      <Link color="inherit" href="#" onClick={handleClick} underline="hover">
        Catalog
      </Link>
      <Typography color="text.primary">Accessories</Typography>
    </Breadcrumbs>
  );
}

export function DrawerDemo() {
  const [open, setOpen] = useState(false);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [selected, setSelected] = useState(0);
  const close = () => setOpen(false);
  const items = [
    { icon: <TrayIcon size={20} />, label: 'Inbox' },
    { icon: <PaperPlaneTiltIcon size={20} />, label: 'Sent' },
    { icon: <FileIcon size={20} />, label: 'Drafts' },
  ];
  return (
    <OverlayStage stageRef={setStage}>
      <Button onClick={() => setOpen(true)} variant="outlined">
        Open drawer
      </Button>
      <Drawer
        anchor="left"
        ModalProps={{ container: stage ?? undefined }}
        onClose={close}
        open={open}
        slotProps={{
          backdrop: { sx: { position: 'absolute' } },
          paper: { sx: { position: 'absolute', width: 200 } },
        }}
        sx={{ position: 'absolute' }}
      >
        <List dense disablePadding sx={{ py: 1 }}>
          {items.map((item, index) => (
            <ListItemButton
              key={item.label}
              onClick={() => {
                setSelected(index);
                close();
              }}
              selected={selected === index}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </OverlayStage>
  );
}

export function LinkDemo() {
  const handleClick = (event: SyntheticEvent) => {
    event.preventDefault();
  };
  return (
    <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
      <Link href="#" onClick={handleClick} underline="hover">
        Link
      </Link>
      <Link href="#" onClick={handleClick} underline="always">
        Link
      </Link>
      <Link href="#" onClick={handleClick} underline="none">
        Link
      </Link>
      <Link color="inherit" href="#" onClick={handleClick}>
        Link
      </Link>
    </Stack>
  );
}

export function MenuDemo() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const open = Boolean(anchorEl);
  const close = () => setAnchorEl(null);
  return (
    <OverlayStage stageRef={setStage}>
      <Button
        aria-controls={open ? 'preview-menu' : undefined}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={(event) => setAnchorEl(event.currentTarget)}
        variant="outlined"
      >
        Open menu
      </Button>
      <Menu
        anchorEl={anchorEl}
        container={stage ?? undefined}
        id="preview-menu"
        onClose={close}
        open={open}
      >
        <MenuItem onClick={close}>Profile</MenuItem>
        <MenuItem onClick={close}>My account</MenuItem>
        <MenuItem onClick={close}>Logout</MenuItem>
      </Menu>
    </OverlayStage>
  );
}

export function PaginationDemo() {
  const [page, setPage] = useState(1);
  return (
    <Stack spacing={1.5}>
      <Pagination count={10} onChange={(_, value) => setPage(value)} page={page} />
      <Pagination
        color="primary"
        count={10}
        onChange={(_, value) => setPage(value)}
        page={page}
        variant="outlined"
      />
    </Stack>
  );
}

// Speed Dial opens upward from its floating action button, so its
// stage is taller than the shared overlay stage: a containing box
// in the style of the MUI docs pattern, with the dial anchored to
// the box's bottom-right corner and room above it for the actions.
export function SpeedDialDemo() {
  const [open, setOpen] = useState(false);
  const actions = [
    { icon: <CopyIcon size={20} />, name: 'Copy' },
    { icon: <FloppyDiskIcon size={20} />, name: 'Save' },
    { icon: <PrinterIcon size={20} />, name: 'Print' },
  ];
  return (
    <Box
      sx={{
        bgcolor: 'action.hover',
        borderRadius: 1,
        height: 248,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <SpeedDial
        ariaLabel="Speed dial"
        icon={<SpeedDialIcon />}
        onClose={() => setOpen(false)}
        onOpen={() => setOpen(true)}
        open={open}
        sx={{ bottom: 16, position: 'absolute', right: 16 }}
      >
        {actions.map((action) => (
          <SpeedDialAction
            icon={action.icon}
            key={action.name}
            slotProps={{ fab: { 'aria-label': action.name } }}
            title={action.name}
          />
        ))}
      </SpeedDial>
    </Box>
  );
}

export function StepperDemo() {
  const steps = [
    {
      content: 'Choose the audience, budget, and schedule for the campaign.',
      label: 'Campaign settings',
    },
    {
      content: 'Group the ads that share the same targeting and bids.',
      label: 'Ad group',
    },
    {
      content: 'Write the headline and copy, then launch the ad.',
      label: 'Create ad',
    },
  ];
  const [activeStep, setActiveStep] = useState(0);
  const finished = activeStep === steps.length;
  return (
    <Box>
      <Stepper activeStep={activeStep}>
        {steps.map((step) => (
          <Step key={step.label}>
            <StepLabel>{step.label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {finished ? (
        <>
          <Typography sx={{ mt: 2 }}>All steps completed.</Typography>
          <Button onClick={() => setActiveStep(0)} size="small" sx={{ mt: 1 }}>
            Reset
          </Button>
        </>
      ) : (
        <>
          <Typography sx={{ mt: 2 }} variant="body2">
            {steps[activeStep].content}
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
            <Button
              disabled={activeStep === 0}
              onClick={() => setActiveStep((current) => current - 1)}
              size="small"
            >
              Back
            </Button>
            <Button
              onClick={() => setActiveStep((current) => current + 1)}
              size="small"
              variant="contained"
            >
              {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}

export function TabsDemo() {
  const [value, setValue] = useState(0);
  const panels = ['Item One', 'Item Two', 'Item Three'];
  return (
    <Box>
      <Tabs
        aria-label="Preview tabs"
        onChange={(_, newValue) => setValue(newValue)}
        value={value}
      >
        {panels.map((label, index) => (
          <Tab
            aria-controls={`preview-tabpanel-${index}`}
            id={`preview-tab-${index}`}
            key={label}
            label={label}
          />
        ))}
      </Tabs>
      {panels.map((label, index) => (
        <Box
          hidden={value !== index}
          id={`preview-tabpanel-${index}`}
          key={label}
          role="tabpanel"
          sx={{ pt: 1.5 }}
        >
          {value === index && (
            <Typography variant="body2">{`${label} panel.`}</Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}

// Layout demos, in the same style as the categories above:
// canonical usage per component, interaction state local to the
// card where the component has a meaningful interaction. None of
// the four is an overlay, so nothing here needs a stage.

// Box is the sx-driven primitive: the demo's two boxes take their
// background, padding, border, and radius from the edited theme
// through sx, which is the whole point of the component.
export function BoxDemo() {
  return (
    <Stack spacing={1.5}>
      <Box
        sx={{
          bgcolor: 'primary.main',
          borderRadius: 2,
          color: 'primary.contrastText',
          p: 2,
        }}
      >
        <Typography variant="body2">Background, padding, and radius from sx</Typography>
      </Box>
      <Box sx={{ border: 1, borderColor: 'primary.main', borderRadius: 1, p: 1.5 }}>
        <Typography variant="body2">Border and radius from sx</Typography>
      </Box>
    </Stack>
  );
}

// Container centres content and caps its width at the chosen
// breakpoint. The dashed frame is the card-width "viewport" the
// container sits in; the toggle switches the maxWidth prop between
// two breakpoints and off, and the shaded container shows which
// value is in force.
export function ContainerDemo() {
  const [maxWidth, setMaxWidth] = useState<'sm' | 'xs' | false>('xs');
  return (
    <Stack spacing={1.5}>
      <ToggleButtonGroup
        exclusive
        onChange={(_, newMaxWidth) => {
          if (newMaxWidth !== null) setMaxWidth(newMaxWidth);
        }}
        size="small"
        value={maxWidth}
      >
        <ToggleButton value="xs">XS</ToggleButton>
        <ToggleButton value="sm">SM</ToggleButton>
        <ToggleButton value={false}>None</ToggleButton>
      </ToggleButtonGroup>
      <Box sx={{ border: '1px dashed', borderColor: 'divider', width: '100%' }}>
        <Container maxWidth={maxWidth} sx={{ bgcolor: 'action.hover', py: 1.5 }}>
          <Typography variant="body2">
            {maxWidth === false ? 'No max width' : `maxWidth ${maxWidth}`}
          </Typography>
        </Container>
      </Box>
    </Stack>
  );
}

// Grid uses the MUI v9 API: a container with spacing, and items
// sized with the size prop (responsive objects included), not the
// v1 item/xs props. The cell labels are the column counts the
// items take at the small breakpoint and up: two halves, then
// three thirds.
export function GridDemo() {
  const cells = [
    { id: 'half-a', label: '6', size: { sm: 6, xs: 12 } },
    { id: 'half-b', label: '6', size: { sm: 6, xs: 12 } },
    { id: 'third-a', label: '4', size: { xs: 4 } },
    { id: 'third-b', label: '4', size: { xs: 4 } },
    { id: 'third-c', label: '4', size: { xs: 4 } },
  ];
  return (
    <Grid container spacing={2}>
      {cells.map((cell) => (
        <Grid key={cell.id} size={cell.size}>
          <Box
            sx={{
              bgcolor: 'primary.main',
              borderRadius: 1,
              color: 'primary.contrastText',
              p: 1,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2">{cell.label}</Typography>
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}

// Stack lays its children out in one direction with even spacing;
// the demo adds a divider between the items and a toggle for the
// direction, with the divider's orientation following it.
export function StackDemo() {
  const [direction, setDirection] = useState<'column' | 'row'>('column');
  const items = ['One', 'Two', 'Three'];
  return (
    <Stack spacing={1.5}>
      <ToggleButtonGroup
        exclusive
        onChange={(_, newDirection) => {
          if (newDirection !== null) setDirection(newDirection);
        }}
        size="small"
        value={direction}
      >
        <ToggleButton value="column">Column</ToggleButton>
        <ToggleButton value="row">Row</ToggleButton>
      </ToggleButtonGroup>
      <Stack
        direction={direction}
        divider={
          <Divider
            flexItem
            orientation={direction === 'row' ? 'vertical' : 'horizontal'}
          />
        }
        spacing={2}
      >
        {items.map((item) => (
          <Box
            key={item}
            sx={{
              bgcolor: 'action.hover',
              borderRadius: 1,
              flex: 1,
              p: 1,
              textAlign: 'center',
            }}
          >
            <Typography variant="body2">{item}</Typography>
          </Box>
        ))}
      </Stack>
    </Stack>
  );
}
