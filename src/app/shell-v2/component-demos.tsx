import { useEffect, useState, type ReactNode } from 'react';
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
  Box,
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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Fab,
  FormControl,
  FormControlLabel,
  FormLabel,
  Icon,
  IconButton,
  LinearProgress,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Radio,
  RadioGroup,
  Rating,
  Skeleton,
  Slider,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { BellIcon } from '@phosphor-icons/react/dist/csr/Bell';
import { CaretDoubleLeftIcon } from '@phosphor-icons/react/dist/csr/CaretDoubleLeft';
import { CaretDoubleRightIcon } from '@phosphor-icons/react/dist/csr/CaretDoubleRight';
import { CaretDownIcon } from '@phosphor-icons/react/dist/csr/CaretDown';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { DotsThreeVerticalIcon } from '@phosphor-icons/react/dist/csr/DotsThreeVertical';
import { FileIcon } from '@phosphor-icons/react/dist/csr/File';
import { HeartIcon } from '@phosphor-icons/react/dist/csr/Heart';
import { ListIcon } from '@phosphor-icons/react/dist/csr/List';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { ShareNetworkIcon } from '@phosphor-icons/react/dist/csr/ShareNetwork';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { TrayIcon } from '@phosphor-icons/react/dist/csr/Tray';
import { XIcon } from '@phosphor-icons/react/dist/csr/X';

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

// A compact working Transfer List (the MUI docs pattern, trimmed to a
// card): two checkbox lists with move-all and move-checked buttons,
// all state local to the card.
export function TransferListDemo() {
  const labels = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
  const [checked, setChecked] = useState<readonly number[]>([]);
  const [left, setLeft] = useState<readonly number[]>([0, 1, 2]);
  const [right, setRight] = useState<readonly number[]>([3, 4]);

  const leftChecked = checked.filter((value) => left.includes(value));
  const rightChecked = checked.filter((value) => right.includes(value));

  const handleToggle = (value: number) => () => {
    setChecked((current) =>
      current.includes(value)
        ? current.filter((candidate) => candidate !== value)
        : [...current, value],
    );
  };

  const handleAllRight = () => {
    setRight((current) => [...current, ...left]);
    setLeft([]);
  };

  const handleCheckedRight = () => {
    setRight((current) => [...current, ...leftChecked]);
    setLeft((current) => current.filter((value) => !leftChecked.includes(value)));
    setChecked((current) =>
      current.filter((value) => !leftChecked.includes(value)),
    );
  };

  const handleCheckedLeft = () => {
    setLeft((current) => [...current, ...rightChecked]);
    setRight((current) =>
      current.filter((value) => !rightChecked.includes(value)),
    );
    setChecked((current) =>
      current.filter((value) => !rightChecked.includes(value)),
    );
  };

  const handleAllLeft = () => {
    setLeft((current) => [...current, ...right]);
    setRight([]);
  };

  const listFor = (items: readonly number[]) => (
    <List dense sx={{ flex: 1, minWidth: 0, overflow: 'auto', py: 0 }}>
      {items.map((value) => (
        <ListItemButton key={value} onClick={handleToggle(value)} sx={{ px: 1 }}>
          <ListItemIcon sx={{ minWidth: 32 }}>
            <Checkbox
              checked={checked.includes(value)}
              disableRipple
              edge="start"
              size="small"
              tabIndex={-1}
            />
          </ListItemIcon>
          <ListItemText primary={labels[value]} />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {listFor(left)}
      <Stack spacing={0.5}>
        <Button
          aria-label="Move all right"
          disabled={left.length === 0}
          onClick={handleAllRight}
          size="small"
          sx={{ minWidth: 0, px: 0.5 }}
          variant="outlined"
        >
          <CaretDoubleRightIcon size={16} />
        </Button>
        <Button
          aria-label="Move selected right"
          disabled={leftChecked.length === 0}
          onClick={handleCheckedRight}
          size="small"
          sx={{ minWidth: 0, px: 0.5 }}
          variant="outlined"
        >
          <CaretRightIcon size={16} />
        </Button>
        <Button
          aria-label="Move selected left"
          disabled={rightChecked.length === 0}
          onClick={handleCheckedLeft}
          size="small"
          sx={{ minWidth: 0, px: 0.5 }}
          variant="outlined"
        >
          <CaretLeftIcon size={16} />
        </Button>
        <Button
          aria-label="Move all left"
          disabled={right.length === 0}
          onClick={handleAllLeft}
          size="small"
          sx={{ minWidth: 0, px: 0.5 }}
          variant="outlined"
        >
          <CaretDoubleLeftIcon size={16} />
        </Button>
      </Stack>
      {listFor(right)}
    </Stack>
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

// MUI's Icon renders ligature text from an icon font, and the app
// loads no ligature font; the demo instead passes an inline SVG as
// the child, a usage the component also supports, and varies its
// fontSize and color props across the row.
function StarSvg() {
  return (
    <svg aria-hidden="true" fill="currentColor" height="1em" viewBox="0 0 24 24" width="1em">
      <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
    </svg>
  );
}

export function IconDemo() {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
      <Icon fontSize="small">
        <StarSvg />
      </Icon>
      <Icon>
        <StarSvg />
      </Icon>
      <Icon color="primary" fontSize="large">
        <StarSvg />
      </Icon>
      <Icon color="disabled" fontSize="large">
        <StarSvg />
      </Icon>
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

export function TypographyDemo() {
  return (
    <Stack spacing={0.5}>
      <Typography variant="h5">h5 heading</Typography>
      <Typography variant="subtitle1">subtitle1 text</Typography>
      <Typography variant="body1">body1 text</Typography>
      <Typography variant="body2">body2 text</Typography>
      <Typography variant="caption">caption text</Typography>
      <Typography variant="overline">overline text</Typography>
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

export function AlertDemo() {
  const [successOpen, setSuccessOpen] = useState(true);
  return (
    <Stack spacing={1.5}>
      <Alert severity="error">This is an error Alert.</Alert>
      <Alert severity="warning">This is a warning Alert.</Alert>
      <Alert severity="info">This is an info Alert.</Alert>
      {successOpen && (
        <Alert onClose={() => setSuccessOpen(false)} severity="success">
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
      <Button onClick={() => setOpen(true)} variant="outlined">
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
      <Button onClick={() => setOpen(true)} variant="outlined">
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
      <Button onClick={() => setOpen(true)} variant="outlined">
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

export function PaperDemo() {
  const elevations = [0, 1, 3, 6];
  const squareSx = {
    alignItems: 'center',
    display: 'flex',
    height: 72,
    justifyContent: 'center',
    width: 72,
  };
  return (
    <Stack direction="row" spacing={1.5} sx={{ flexWrap: 'wrap' }}>
      {elevations.map((elevation) => (
        <Paper elevation={elevation} key={elevation} sx={squareSx}>
          <Typography variant="caption">{elevation}</Typography>
        </Paper>
      ))}
      <Paper sx={squareSx} variant="outlined">
        <Typography variant="caption">Outlined</Typography>
      </Paper>
    </Stack>
  );
}
