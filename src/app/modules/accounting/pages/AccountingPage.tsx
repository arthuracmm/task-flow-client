import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import TransationSelector from '../components/TransationSelector';
import BankSelector from '../components/BankSelector';
import DateSelector from '../components/DateSelector';
import Observation from '../components/Observation';
import UploadCSVSimplified from '../components/UploadCSVSimplified';
import { History, KeyboardReturn } from '@mui/icons-material';
import HistoryComp from '../components/HistoryComp';
import apiClient from '@/connection/apiClient';

const AccountingPage: React.FC = () => {
  const [selectedBank, setSelectedBank] = useState<number | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<number | null>(null);
  const [referenceDate, setReferenceDate] = useState<any | null>();
  const [selectedAgency, setSelectedAgency] = useState<number | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [observation, setObservation] = useState<string | null>(null);
  const [batchItemsData, setBatchItemsData] = useState<any[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [viewHistory, setViewHistory] = useState<boolean | null>(false)
  const [invalidBatchItems, setInvalidBatchItems] = useState<any[]>([]);

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

  const formatDateForDB = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day} 00:00:00.000`;
  };


  const sendBatchAndItems = async () => {
    try {
      if (!uploadedFileName || !selectedBank || !selectedTransaction) {
        alert('Preencha os campos obrigatórios');
        return;
      }

      const sequenceResponse = await apiClient.get("/nextValueSequence");

      if (!sequenceResponse || !sequenceResponse.data || !sequenceResponse.data.sequenceNumber) {
        alert('Erro ao obter o número da sequência');
        return;
      }

      const sequenceNumber = sequenceResponse.data.sequenceNumber;

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

      const formattedReferenceDate = referenceDate ? formatDateForDB(new Date(referenceDate)) : null;

      const batchPayload = {
        filename: uploadedFileName,
        sequenceNumber: sequenceNumber,
        status: 'complete',
        referenceDate: formattedReferenceDate,
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

      const validBatchItems = [];
      const invalidBatchItems = [];

      for (const item of batchItemsData) {
        const authorizationExists = await checkAuthorizationExists(String(item.authorizationNumber));

        const updatedItem = { ...item, batchId };

        if (authorizationExists) {
          updatedItem.status = "valid";
          validBatchItems.push(updatedItem);
        } else {
          updatedItem.status = "invalid";
          invalidBatchItems.push(updatedItem);
          setInvalidBatchItems((prev) => [...prev, updatedItem]);

          const updatedBatchItemsData = batchItemsData.map((batchItem) =>
            batchItem.id === item.id ? updatedItem : batchItem
          );
          setBatchItemsData(updatedBatchItemsData);
        }
      }


      if (validBatchItems.length > 0 || invalidBatchItems.length > 0) {
        const allBatchItems = [...validBatchItems, ...invalidBatchItems];
        await apiClient.post("/batch-items", allBatchItems);
        alert('Batch e itens enviados com sucesso!');
      } else {
        alert('Nenhum item válido ou inválido foi encontrado para adicionar ao batch.');
      }

      setBatchItemsData([]);
      setUploadedFileName(null);
      setSelectedBank(null);
      setSelectedTransaction(null);
      setViewHistory(true);
    } catch (error: any) {
      alert(error.message || 'Erro desconhecido');
    }
  };

  const checkAuthorizationExists = async (authorizationNumber: string | number) => {
    try {
      const response = await apiClient.get(`/authorizationexists/${authorizationNumber}`);

      return response.data.exists;
    } catch (error) {
      console.error('Erro ao verificar autorização:', error);
      return false;
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
              <DateSelector
                selectedDate={referenceDate}
                onChange={(date: string) => setReferenceDate(date)}
              />
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
        <HistoryComp invalidBatchItems={invalidBatchItems} />
      )}
    </Box>
  );
};

export default AccountingPage;
