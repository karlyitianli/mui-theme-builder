import { useState } from 'react';
import {
  Autocomplete,
  Button,
  ButtonGroup,
  Checkbox,
  Fab,
  FormControl,
  FormControlLabel,
  FormLabel,
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
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { CaretDoubleLeftIcon } from '@phosphor-icons/react/dist/csr/CaretDoubleLeft';
import { CaretDoubleRightIcon } from '@phosphor-icons/react/dist/csr/CaretDoubleRight';
import { CaretLeftIcon } from '@phosphor-icons/react/dist/csr/CaretLeft';
import { CaretRightIcon } from '@phosphor-icons/react/dist/csr/CaretRight';
import { PlusIcon } from '@phosphor-icons/react/dist/csr/Plus';

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
