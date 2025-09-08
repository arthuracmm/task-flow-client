"use client";
import React from 'react';
import { Box, Typography } from '@mui/material';
import { RegulationPage } from './modules/regulation';
import Sidebar from './componets/Sidebar';
import { FinancialPage } from './modules/financial';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AccountingPage } from './modules/accounting';

export default function Home() {
  const [selectedOption, setSelectedOption] = React.useState<number>(0);

  const renderContent = () => {
    switch (selectedOption) {
      case 0:
        return <AccountingPage />;
      case 1:
        return <FinancialPage />;
      case 2:
        return <AccountingPage />;
      default:
        return <Typography variant="h6">Selecione uma opção</Typography>;
    }
  };
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>

      <Box display="flex">
        <Box >
          <Sidebar selectedOption={selectedOption} setSelectedOption={setSelectedOption} />
        </Box>
        <Box
          component="main"
          sx={{
            width: "100%",
            height: "100vh",
            overflow: "auto",
          }}
        >
          {renderContent()}
        </Box>
      </Box>

    </QueryClientProvider>

  );
}
