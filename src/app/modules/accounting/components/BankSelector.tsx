    import { Box, InputLabel, MenuItem, Select } from "@mui/material"

    const BankSelector = ({ selectedBank, onChange }: { selectedBank: number | null, onChange: (account: number) => void }) => {
        const banks = [
            {
                bank: 'Sicoob',
                agency: 4321,
                account: 1061
            },
            {
                bank: 'Sicoob',
                agency: 4321,
                account: 2004834
            },
            {
                bank: 'Sicoob',
                agency: 4321,
                account: 2011832
            },
            
        ];

        return (
            <Box>
                <InputLabel sx={{ ml: 1 }} id="bank">Banco / Âgencia / Conta
                </InputLabel>
                <Select
                    sx={{ width: '100%', ml: 1 }}
                    size="small"
                    variant="standard"
                    value={selectedBank ?? ""}
                    label="Banco"
                    labelId="bank"
                    onChange={(e) => onChange(Number(e.target.value))}
                >
                    {banks.map((bank) => (
                        <MenuItem key={bank.account} value={bank.account}>
                            {`${bank.bank} - ${bank.agency} - ${bank.account} - Escritural e Conta Corrente - Conta Corrente`}
                        </MenuItem>
                    ))}
                </Select>
            </Box>
        )

    }

    export default BankSelector;