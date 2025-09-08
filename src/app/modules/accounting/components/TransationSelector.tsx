import { fetchData } from "@/connection";
import { Box, CircularProgress, InputLabel, MenuItem, Select, FormControl, InputAdornment } from "@mui/material";
import { useEffect, useState } from "react";

const TransactionSelector = ({ selectedService, onChange }: { selectedService: number | null, onChange: (id: number) => void }) => {
    const [transactions, setTransactions] = useState<{id: number, cd: number; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        fetchData("/transaction")
            .then(res => {
                setTransactions(res);
                setIsLoading(false);
            })
            .catch(error => {
                console.log(error);
                setIsLoading(false);
            });
    }, []);

    return (
        <Box>
            <InputLabel sx={{ ml: 1 }}>Transação financeira</InputLabel>
            <Select
                sx={{ width: '100%', ml: 1 }}
                size="small"
                variant="standard"
                value={selectedService ?? ""}
                label="Transação"
                labelId="transaction"
                onChange={(e) => onChange(Number(e.target.value))}
                displayEmpty
            >
                {transactions.map((transaction) => (
                    <MenuItem key={transaction.id} value={transaction.cd}>
                        {transaction.name}
                    </MenuItem>
                ))}
            </Select>

            {isLoading && (
                <Box display="flex" justifyContent="center" mt={2}>
                    <CircularProgress />
                </Box>
            )}
        </Box>
    );
};

export default TransactionSelector;
