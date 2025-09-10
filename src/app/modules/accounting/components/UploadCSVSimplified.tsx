import React, { useState } from "react";
import { Box, Button, Typography, Alert } from "@mui/material";
import Papa from "papaparse";
import * as XLSX from "xlsx";

type UploadProps = {
  onDataExtracted: (data: any[]) => void;
  onFileNameExtracted?: (fileName: string) => void; // nova prop
};

const columnMapping: { [key: string]: string } = {
  "Parcela": "installment",
  "Total de parcela": "totalInstallment",
  "Número da autorização": "authorizationNumber",
  "Valor parcela bruto": "grossInstallmentAmount",
  "Desconto parcela": "installmentDiscount",
  "Valor parcela liquido": "netInstallmentAmount",
  "Total plano de venda": "totalSalesPlan",
};

const expectedColumns = Object.keys(columnMapping);

const UploadCSVXLSX: React.FC<UploadProps> = ({ onDataExtracted, onFileNameExtracted }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);

  const reset = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (onFileNameExtracted) onFileNameExtracted(file.name); // envia nome do arquivo
      processFile(file);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (onFileNameExtracted) onFileNameExtracted(file.name); // envia nome do arquivo
      processFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const renameColumns = (row: any): any => {
    const newRow: any = {};
    for (const key in row) {
      const mappedKey = columnMapping[key.trim()];
      if (mappedKey) {
        newRow[mappedKey] = row[key];
      }
    }
    return newRow;
  };
  const processParsedData = (rawData: any[]) => {
    const fileColumns = Object.keys(rawData[0] || {});
    const missingColumns = expectedColumns.filter(
      (col) => !fileColumns.includes(col)
    );

    if (missingColumns.length > 0) {
      setError(`Campos ausentes: ${missingColumns.join(", ")}`);
      return;
    }

    const renamedData = rawData.map(renameColumns);

    const filteredData = renamedData.filter((row) =>
      Object.values(columnMapping).every(
        (colKey) => row[colKey] !== undefined && row[colKey] !== null && row[colKey] !== ""
      )
    );

    onDataExtracted(filteredData);
    setParsedData(filteredData);
  };


  const processFile = (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "csv") {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const data = results.data as any[];
          processParsedData(data);
        },
        error: () => setError("Erro ao processar CSV."),
      });
    } else if (extension === "xlsx") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);
        processParsedData(jsonData);
      };
      reader.onerror = () => setError("Erro ao ler arquivo XLSX.");
      reader.readAsArrayBuffer(file);
    } else {
      setError("Formato não suportado. Envie um arquivo .csv ou .xlsx");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      p={2}
      height={'100%'}
      border="1px dashed gray"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{ backgroundColor: dragActive ? "#f0f0f0" : "transparent" }}
    >
      {!selectedFile ? (
        <Box textAlign="center">
          <Button variant="contained" component="label">
            Selecione um arquivo CSV ou XLSX
            <input type="file" accept=".csv,.xlsx" hidden onChange={handleFileChange} />
          </Button>
          <Typography variant="body2" mt={1}>
            Ou arraste e solte o arquivo aqui
          </Typography>
        </Box>
      ) : (
        <Box mt={2} textAlign="center" >
          <Typography variant="body1">Arquivo: {selectedFile.name}</Typography>
          <Button sx={{ mt: 1 }} variant="outlined" onClick={reset}>
            Novo arquivo
          </Button>
          <Typography sx={{ mt: 2 }}> Itens detectados no arquivo: {parsedData.length}</Typography>
        </Box>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
    </Box>
  );
};

export default UploadCSVXLSX;
