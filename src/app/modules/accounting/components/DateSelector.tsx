import React from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { ptBR } from 'date-fns/locale';

interface DateSelectorProps {
  selectedDate: Date | null;
  onChange: (date: Date | null) => void;
}

const DateSelector: React.FC<DateSelectorProps> = ({ selectedDate, onChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <DatePicker
        label="Data Referência"
        value={selectedDate}
        onChange={onChange}
        format="dd/MM/yyyy"
        sx={{ width: '100%', ml: 1 }}
        slotProps={{
          textField: {
            size: 'small',
            variant: 'standard',
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DateSelector;
