import React, { useEffect, useState } from "react";
import {
    Box,
    Typography,
    Divider,
    CircularProgress,
    List,
    ListItemButton,
    Collapse,
} from "@mui/material";
import { Span } from "next/dist/trace";

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
    authorizationNumber: number;
    grossInstallmentAmount: string;
    installmentDiscount: string;
    netInstallmentAmount: string;
    totalSalesPlan: string;
    createdAt: string;
    updatedAt: string;
}

const HistoryComp: React.FC = () => {
    const [batches, setBatches] = useState<Batch[]>([]);
    const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedBatchId, setExpandedBatchId] = useState<number | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const batchesRes = await fetch("http://localhost:3000/batches");
                const batchesData: Batch[] = await batchesRes.json();

                const itemsRes = await fetch("http://localhost:3000/batch-items");
                const itemsData: BatchItem[] = await itemsRes.json();

                setBatches(batchesData);
                setBatchItems(itemsData);
            } catch (error) {
                console.error("Erro ao buscar dados:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <CircularProgress />;

    const handleToggle = (batchId: number) => {
        setExpandedBatchId((prev) => (prev === batchId ? null : batchId));
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
                        const itemsForBatch = batchItems.filter(
                            (item) => item.batchId === batch.id
                        );

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
                                            <strong>Itens:</strong> {itemsForBatch.length} | <strong>Total Vendas:</strong> R$ {batch.sumTotalSalesPlan.toFixed(2)}
                                        </Typography>
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

                                        <Divider sx={{ my: 2 }} />

                                        <Typography variant="h6" gutterBottom>
                                            <strong>Itens do Lote:</strong>
                                        </Typography>

                                        {itemsForBatch.length === 0 && (
                                            <Typography variant="body2">Nenhum item encontrado.</Typography>
                                        )}

                                        {itemsForBatch.map((item) => (
                                            <Box
                                                key={item.id}
                                                sx={{
                                                    mb: 1,
                                                    p: 1,
                                                    border: "1px solid #ccc",
                                                    borderRadius: "4px",
                                                }}
                                            >
                                                <Typography>
                                                    <strong>Autorização:</strong> {item.authorizationNumber}
                                                </Typography>
                                                <Typography>
                                                    <strong>Bruto Parcela:</strong> R$ {parseFloat(item.grossInstallmentAmount).toFixed(2)}
                                                </Typography>
                                                <Typography>
                                                    <strong>Desconto:</strong> R$ {parseFloat(item.installmentDiscount).toFixed(2)}
                                                </Typography>
                                                <Typography>
                                                    <strong>Líquido:</strong> R$ {parseFloat(item.netInstallmentAmount).toFixed(2)}
                                                </Typography>
                                                <Typography>
                                                    <strong>Total Plano de Venda:</strong> R$ {parseFloat(item.totalSalesPlan).toFixed(2)}
                                                </Typography>
                                            </Box>
                                        ))}
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
