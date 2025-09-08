import { Box, TextField } from "@mui/material";

const Observation = ({ observation, onChange }: { observation: string | null, onChange: (obs: string) => void }) => {

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    return (
        <Box>
            <TextField
                value={observation || ''}
                onChange={handleChange}
                multiline
                rows={2}
                label="Observação"
                sx={{ width: '100%', ml: 1 }}
                size="small"
                variant="standard"
            />
        </Box>
    );
}

export default Observation;