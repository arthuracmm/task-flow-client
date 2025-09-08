import React, { useState } from 'react';
import { Box, InputLabel, TextField } from '@mui/material';

const DateSelector = ({ selectedDate, onChange }: { selectedDate: string | null, onChange: (date: string) => void }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  return (
    <Box>
      <TextField
        value={selectedDate || ''}
        onChange={handleChange}
        label="DD/MM/YYYY"
        sx={{ width: '100%', ml: 1 }}
        size="small"
        variant="standard"
      />
    </Box>
  );
};

export default DateSelector;
