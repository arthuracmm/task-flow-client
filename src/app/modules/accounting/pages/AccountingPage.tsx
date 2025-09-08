import React, { useState } from 'react';
import { Box, Button, InputLabel } from '@mui/material';
import TransationSelector from '../components/TransationSelector';
import BankSelector from '../components/BankSelector';
import DateSelector from '../components/DateSelector';
import Observation from '../components/Observation';

const RegulationPage: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [selectedReferenceDate, setSelectedReferenceDate] = useState<string | null>(null);
  const [observation, setObservation] = useState<string | null>(null);

  const handleReferenceDateChange = (date: string) => {
    setSelectedReferenceDate(date);
  };

  const handleObservationChange = (obs: string) => {
    setObservation(obs);
  };

  const handleTransactionChange = (cd: number) => {
    setSelectedTransaction(cd);
  };

  const handleBankChange = (account: number) => {
    setSelectedBank(account)
  }

  return (
    <Box>
      <Box display="flex" height={40} justifyContent="start" borderBottom={"1px solid black"} bgcolor={"white"} color={'primary'}>
        <Button
          color="primary"
          sx={{ ml: 1 }}
        >
          Baixa em lote
        </Button>
      </Box>

      <Box display={'flex'} gap={2} margin={2}>
        <Box width={'50%'} bgcolor={'#fff'} padding={2} boxShadow={2}>
          <Box display={'flex'} gap={'1rem'}>
            <Box display={'flex'} flexDirection={'column'} width={'100%'}>
              <InputLabel sx={{ ml: 1 }}>Data Referência</InputLabel>
              <DateSelector selectedDate={selectedReferenceDate} onChange={handleReferenceDateChange} />
            </Box>
          </Box>
          <TransationSelector selectedService={selectedTransaction} onChange={handleTransactionChange} />
          <BankSelector selectedBank={selectedBank} onChange={handleBankChange} />
          <Observation observation={observation} onChange={handleObservationChange} />
        </Box>

        <Box width={'50%'} bgcolor={'#fff'} padding={2} boxShadow={2}>
            
        </Box>
      </Box>
    </Box>
  );
};

export default RegulationPage;
