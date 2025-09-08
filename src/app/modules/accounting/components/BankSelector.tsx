import { Box, InputLabel, MenuItem, Select } from "@mui/material"
import { useState } from "react";

type Bank = {
    id: number;
    bank: string;
    cdBank: number;
    agency: number;
    account: number;
};

const BankSelector = ({
    selectedBank,
    selectedAgency,
    selectedAccount,
    onChange
}: {
    selectedBank: number | null,
    selectedAgency?: number | null,
    selectedAccount?: number | null,
    onChange: (bank: Bank) => void
}) => {
    const banks: Bank[] = [
        { id: 1, bank: 'Sicoob', cdBank: 756, agency: 4321, account: 1061 },
        { id: 2, bank: 'Sicoob', cdBank: 756, agency: 4321, account: 2004834 },
        { id: 3, bank: 'Sicoob', cdBank: 756, agency: 4321, account: 2011832 },
    ];

    const [selected, setSelected] = useState<number | null>(selectedBank);

    const handleChange = (e: any) => {
        const bankId = Number(e.target.value);
        setSelected(bankId);
        const bankObj = banks.find(b => b.id === bankId);
        if (bankObj) onChange(bankObj);
    };

    return (
        <Box>
            <InputLabel sx={{ ml: 1 }} id="bank">Banco / Âgencia / Conta</InputLabel>
            <Select
                sx={{ width: '100%', ml: 1 }}
                size="small"
                variant="standard"
                value={selected ?? ""}
                label="Banco"
                labelId="bank"
                onChange={handleChange}
            >
                {banks.map((bank) => (
                    <MenuItem key={bank.id} value={bank.id}>
                        {`${bank.bank} - ${bank.agency} - ${bank.account} - Escritural e Conta Corrente - Conta Corrente`}
                    </MenuItem>
                ))}
            </Select>
        </Box>
    );
}

export default BankSelector;