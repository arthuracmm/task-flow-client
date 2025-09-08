import React, { useState } from 'react';
import { Box, Button, InputLabel, Typography } from '@mui/material';
import TransationSelector from '../components/TransationSelector';
import BankSelector from '../components/BankSelector';
import DateSelector from '../components/DateSelector';
import Observation from '../components/Observation';
import UploadCSVSimplified from '../components/UploadCSVSimplified';
import { History, KeyboardReturn } from '@mui/icons-material';
import HistoryComp from '../components/HistoryComp';
import apiClient from '@/connection/apiClient';

const AccountingPage: React.FC = () => {
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [observation, setObservation] = useState<string | null>(null);
  const [batchItemsData, setBatchItemsData] = useState<any[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [viewHistory, setViewHistory] = useState<boolean | null>(false)


  const handleObservationChange = (obs: string) => {
    setObservation(obs);
  };

  const handleTransactionChange = (cd: number) => {
    setSelectedTransaction(cd);
  };

  const handleBankChange = (bankObj: any) => {
    setSelectedBank(bankObj.cdBank);
    setSelectedAgency(bankObj.agency);
    setSelectedAccount(bankObj.account);
  }


  const sendBatchAndItems = async () => {
    try {
      if (!uploadedFileName || !selectedBank || !selectedTransaction) {
        alert('Preencha os campos obrigatórios');
        return;
      }

      // Monta os totais somando os valores em batchItemsData
      const totalGrossInstallmentAmount = batchItemsData.reduce(
        (acc: number, item: any) => acc + Number(item.grossInstallmentAmount || 0),
        0
      );
      const totalInstallmentDiscount = batchItemsData.reduce(
        (acc: number, item: any) => acc + Number(item.installmentDiscount || 0),
        0
      );
      const totalNetInstallmentAmount = batchItemsData.reduce(
        (acc: number, item: any) => acc + Number(item.netInstallmentAmount || 0),
        0
      );
      const sumTotalSalesPlan = batchItemsData.reduce(
        (acc: number, item: any) => acc + Number(item.totalSalesPlan || 0),
        0
      );

      const batchPayload = {
        filename: uploadedFileName,
        status: 'complete',
        bankId: selectedBank,
        agencyID: selectedAgency,
        accountId: selectedAccount,
        lowFinancialTransaction: selectedTransaction,
        totalGrossInstallmentAmount,
        totalInstallmentDiscount,
        totalNetInstallmentAmount,
        sumTotalSalesPlan,
      };
      const batchResponse = await apiClient.post("/batches", batchPayload);

      const batchCreated = await batchResponse.data;
      const batchId = batchCreated.id;

      const batchItemsPayload = batchItemsData.map((item: any) => ({
        ...item,
        batchId,
      }));

      await apiClient.post("/batch-items", batchItemsPayload);

      alert('Batch e itens enviados com sucesso!');

      // Reseta estados se quiser
      setBatchItemsData([]);
      setUploadedFileName(null);
      setSelectedBank(null);
      setSelectedTransaction(null);
      setViewHistory(true)
    } catch (error: any) {
      alert(error.message || 'Erro desconhecido');
    }
  };



  return (
    <Box display={'flex'} flexDirection={'column'} height={'100%'}>
      <Box display="flex" height={40} justifyContent="space-between" borderBottom={"1px solid black"} bgcolor={"white"} color={'primary'}>
        <Button
          color="primary"
          sx={{ ml: 1 }}
        >
          Baixa em lote
        </Button>

        <Button
          color="primary"
          sx={{ ml: 1 }}
          onClick={() => setViewHistory(!viewHistory)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {viewHistory ? (
              <>
                Voltar
                <KeyboardReturn />
              </>
            ) : (
              <>
                Ver Histórico
                <History />
              </>
            )}
          </Box>
        </Button>
      </Box>

      {!viewHistory && (
        <Box display={'flex'} flexDirection={'column'} gap={2} margin={2} height={'100%'}>
          <Box display={'flex'} gap={2} height={'100%'}>

            <Box display={'flex'} flexDirection={'column'} gap={3} width={'50%'} bgcolor={'#fff'} padding={2} boxShadow={2}>
              <TransationSelector selectedService={selectedTransaction} onChange={handleTransactionChange} />
              <BankSelector
                selectedBank={selectedBank}
                selectedAgency={selectedAgency}
                selectedAccount={selectedAccount}
                onChange={handleBankChange}
              />
              <Observation observation={observation} onChange={handleObservationChange} />
            </Box>

            <Box width={'50%'} height={'100%'} bgcolor={'#fff'} padding={2} boxShadow={2}>
              <UploadCSVSimplified
                onDataExtracted={(data: any) => setBatchItemsData(data)}
                onFileNameExtracted={(name: string) => setUploadedFileName(name)}
              />
            </Box>
          </Box>

          <Button
            size='large'
            sx={{ bgcolor: '#1976d2', color: '#fff', '&:hover': { bgcolor: '#105daaff' } }}
            onClick={sendBatchAndItems}
          >
            ENVIAR
          </Button>
        </Box>
      )}


      {viewHistory && (
        <HistoryComp />
      )}
    </Box>
  );
};

export default AccountingPage;
