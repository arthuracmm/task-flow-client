import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    List,
    ListItemButton,
    Collapse,
    Button,
    CircularProgress,
} from "@mui/material";
import * as XLSX from "xlsx";
import apiClient from "@/connection/apiClient";

interface Batch {
    id: number;
    filename: string;
    status: string;
    bankId: number;
    agencyID: number;
    accountId: number;
    lowFinancialTransaction: number;
    totalGrossInstallmentAmount: number;
    totalInstallmentDiscount: number;
    totalNetInstallmentAmount: number;
    sumTotalSalesPlan: number;
    createdAt: string;
    updatedAt: string;
}

interface BatchItem {
    id: number;
    batchId: number;
    status: string;
    installment: number;
    totalInstallment: number;
    authorizationNumber: number;
    grossInstallmentAmount: string;
    installmentDiscount: string;
    netInstallmentAmount: string;
    totalSalesPlan: string;
    createdAt: string;
    updatedAt: string;
}

interface HistoryCompProps {
    invalidBatchItems: BatchItem[];
}

const HistoryComp: React.FC<HistoryCompProps> = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
    const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);
    const [invalidBatchItems, setInvalidBatchItems] = useState<BatchItem[]>([]);
    const [loading, setLoading] = useState(false);

    const exportToXlsx = () => {
        if (invalidBatchItems.length === 0) {
            alert("Não há itens inválidos para exportar.");
            return;
        }

        const data = invalidBatchItems.map((item) => ({
            "Parcela": item.installment,
            "Total de parcelao": item.totalInstallment,
            "Número da autorização": item.authorizationNumber,
            "Valor parcela bruto": item.grossInstallmentAmount,
            "Desconto parcela": item.installmentDiscount,
            "Valor parcela liquido": item.netInstallmentAmount,
            "Total plano de venda": item.totalSalesPlan,
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Itens Inválidos");
        XLSX.writeFile(wb, "itens_invalidos.xlsx");
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const batchesRes = await apiClient.get("/batches");
                const batchesData: Batch[] = batchesRes.data;

                const itemsRes = await apiClient.get("/batch-items");
                const itemsData: BatchItem[] = await itemsRes.data;

                setBatches(batchesData);
                setBatchItems(itemsData);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const fetchInvalidItems = async (batchId: number) => {
            try {
                const res = await apiClient.get(`/batches/${batchId}/invalid-items`);

                if (res.data && Array.isArray(res.data)) {
                    setInvalidBatchItems(res.data);
                } else {
                    setInvalidBatchItems([]);
                }
            } catch (error: any) {
                if (error.response && error.response.status === 404) {
                    console.log('Nenhum item inválido encontrado para este lote.');
                    setInvalidBatchItems([]);
                } else {
                    console.error('Erro ao buscar itens inválidos:', error);
                    setInvalidBatchItems([]);
                }
            }
        };

        if (expandedBatchId !== null) {
            fetchInvalidItems(expandedBatchId);
        } else {
            setInvalidBatchItems([]);
        }
    }, [expandedBatchId]);

    const handleToggle = (batchId: number) => {
        setExpandedBatchId((prev) => (prev === batchId ? null : batchId));
    };

    const handleBatchSettlement = async (items: BatchItem[]) => {
        setLoading(true);
        try {
            for (const item of items) {
                apiClient.put(`/batch-items/update-situation/${item.authorizationNumber}/${item.batchId}`)
                    .then(() => console.log(`Item ${item.id} atualizado com sucesso.`))
                    .catch(err => console.error(`Erro no item ${item.id}`, err));
            }
            // Atualiza o estado após disparar todas (não aguarda)
            setBatchItems(prev =>
                prev.map(bi =>
                    items.find(i => i.id === bi.id)
                        ? { ...bi, status: 'L' }
                        : bi
                )
            );
        } catch (error) {
            console.error("Erro ao realizar baixa:", error);
            alert("Ocorreu um erro ao processar a baixa.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ p: 2, width: '100%' }} display={'flex'} flexDirection={'column'} alignItems={'center'}>
            <Typography variant="h4" gutterBottom color="primary">
                Baixas
            </Typography>

            <List sx={{ width: '100%' }}>
                {batches
                    .slice()
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 8)
                    .map((batch) => {
                        const itemsForBatch = batchItems.filter((item) => item.batchId === batch.id);
                        const validItems = itemsForBatch.filter((item) => item.status === 'A' || item.status === 'L');
                        const invalidItems = itemsForBatch.filter((item) => item.status === 'invalid');

                        const isExpanded = expandedBatchId === batch.id;

                        return (
                            <Box key={batch.id} sx={{ mb: 2, }}>
                                <ListItemButton onClick={() => handleToggle(batch.id)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff' }}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.3 }}>
                                            {new Date(batch.createdAt).toLocaleDateString()}
                                        </Typography>
                                        <Typography variant="body1" fontWeight="bold">
                                            Arquivo: {batch.filename}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            <strong>Itens:</strong> {validItems.length} | <strong>Total Vendas:</strong> R$ {batch.sumTotalSalesPlan.toFixed(2)}
                                        </Typography>
                                        {invalidItems.length > 0 && (
                                            <Typography variant="body2" color="red">
                                                <strong>Itens com erro: </strong> {invalidItems.length}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box>
                                        {batch.status === "pending" ? (
                                            <Typography variant="subtitle1" gutterBottom bgcolor={'#ffc400ff'} padding={1} paddingX={3} borderRadius={2}>
                                                Pendente
                                            </Typography>
                                        ) : (
                                            <Typography variant="subtitle1" gutterBottom bgcolor={'#08bf17ff'} padding={1} paddingX={3} borderRadius={2}>
                                                Completo
                                            </Typography>
                                        )}
                                    </Box>
                                </ListItemButton>


                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                    <Box sx={{ mx: 4, borderLeft: "2px solid #1976d2", px: 2, py: 1, bgcolor: '#fff' }}>
                                        <Box sx={{ display: "flex", justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Box>
                                                <Typography variant="body2">
                                                    <strong>Banco: </strong> {batch.bankId} |  <strong>Agência:</strong> {batch.agencyID} |  <strong>Conta:</strong>{" "}
                                                    {batch.accountId}
                                                </Typography>
                                                <Typography>
                                                    <strong>Transação Financeira Baixa:</strong> {batch.lowFinancialTransaction}
                                                </Typography>
                                                <Typography>
                                                    <strong>Total Bruto Parcelas:</strong> R$ {batch.totalGrossInstallmentAmount.toFixed(2)}
                                                </Typography>
                                                <Typography>
                                                    <strong>Desconto Total:</strong> R$ {batch.totalInstallmentDiscount.toFixed(2)}
                                                </Typography>
                                                <Typography>
                                                    <strong>Total Líquido:</strong> R$ {batch.totalNetInstallmentAmount.toFixed(2)}
                                                </Typography>
                                                <Typography>
                                                    <strong>Plano Total de Vendas</strong>: R$ {batch.sumTotalSalesPlan.toFixed(2)}
                                                </Typography>
                                            </Box>
                                            {validItems.every(item => item.status === 'A') ? (
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => handleBatchSettlement(validItems)}
                                                    sx={{ mt: 2 }}
                                                >
                                                    {loading ? <CircularProgress size={24} color="inherit" /> : `Realizar Baixa de ${validItems.length} ${validItems.length === 1 ? 'item' : 'itens'}`}
                                                </Button>
                                            ) : (
                                                <Button
                                                    disabled
                                                    variant="outlined"
                                                    color="inherit"
                                                    sx={{ mt: 2 }}
                                                >
                                                    Todos os itens já foram liquidados
                                                </Button>
                                            )}

                                        </Box>

                                        <Box>
                                            {invalidBatchItems.length > 0 && (
                                                <Box sx={{ mt: 4 }}>
                                                    <Typography variant="h5" color="error" gutterBottom>
                                                        Itens com Autorização Inválida:
                                                    </Typography>
                                                    {invalidBatchItems.map((item, index) => (
                                                        <Box key={index} sx={{ p: 2, mb: 2, bgcolor: "#f8d7da", borderRadius: "4px" }}>
                                                            <Typography>
                                                                <strong>Autorização:</strong> {item.authorizationNumber}
                                                            </Typography>
                                                            <Typography variant="body2" color="error">
                                                                Esta autorização não foi encontrada no banco de dados.
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                    <Button
                                                        variant="contained"
                                                        color="secondary"
                                                        onClick={exportToXlsx}
                                                        sx={{ mt: 2 }}
                                                    >
                                                        Exportar para Excel
                                                    </Button>
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>
                                </Collapse>
                            </Box>
                        );
                    })}
            </List>
        </Box>
    );
};

export default HistoryComp;
