import { useState } from 'react';
import {
  Autocomplete,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  ButtonGroup,
  Checkbox,
  Chip,
  Divider,
  Fab,
  FormControl,
  FormControlLabel,
  FormLabel,
  Icon,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Radio,
  RadioGroup,
  Rating,
  Slider,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import { BellIcon } from '@phosphor-icons/react/dist/csr/Bell';
import { CaretDoubleLeftIcon } from '@phosphor-icons/react/dist/csr/CaretDoubleLeft';
import { CaretDoubleRightIcon } from '@phosphor-icons/react/dist/csr/CaretDoubleRight';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { FileIcon } from '@phosphor-icons/react/dist/csr/File';
import { PaperPlaneTiltIcon } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';
import { TrashIcon } from '@phosphor-icons/react/dist/csr/Trash';
import { TrayIcon } from '@phosphor-icons/react/dist/csr/Tray';

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
