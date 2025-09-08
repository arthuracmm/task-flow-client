import React, { useState } from 'react';
import { Box, Button, Drawer, List, Typography } from '@mui/material';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import { KeyboardDoubleArrowLeft, KeyboardDoubleArrowRight, LocalAtm} from '@mui/icons-material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

interface SidebarProps {
  selectedOption: number;
  setSelectedOption: React.Dispatch<React.SetStateAction<number>>;
}

const sidebarItems = [
  {
    "title": "Regulação",
    "icon": <HealthAndSafetyIcon sx={{ color: 'white' }} />
  },
  {
    "title": "Financeiro",
    "icon": <LocalAtm sx={{ color: 'white' }} />
  },
  {
    "title": "Baixas",
    "icon": <AccountBalanceWalletIcon sx={{ color: 'white' }} />
  },
]

const Sidebar: React.FC<SidebarProps> = ({ selectedOption, setSelectedOption }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: isCollapsed ? 80 : 200,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: isCollapsed ? 80 : 200,
          boxSizing: 'border-box',
        },
      }}
    >
      <Button
        onClick={toggleSidebar}
        sx={{
          bgcolor: "#1976d2",
          color: "white",
          justifyContent: "center",
          alignSelf: 'center',
          minHeight: 40,
          borderRadius: 0
        }}
        startIcon={isCollapsed ? <KeyboardDoubleArrowRight /> : <KeyboardDoubleArrowLeft />}
        fullWidth
      >
      </Button>
      {!isCollapsed && <Box height={110} borderBottom={"1px solid white"} bgcolor={"#004792"}>
        <Box
          component="img"
          sx={{
            height: 'auto',
            width: '100%',
            maxHeight: 233,
            maxWidth: 350,
            objectFit: 'contain',
            mt: 1,
            p: 1
          }}
          alt="The house from the offer."
          src="img/Grupo Santa Casa horizontal PNG.png"
        />
      </Box>}
      <Box bgcolor={"#004792"} height={"100vh"} display={"flex"} flexDirection={"column"} justifyContent={"space-between"}>
        <Box color="white">
          <List
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {sidebarItems.map((item, index) => (
              <Button
                key={index}
                onClick={() => setSelectedOption(index)} 
                startIcon={isCollapsed ? item.icon : null}
                sx={{
                  bgcolor: selectedOption === index ? "#1976d2" : "", 
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  width: '100%',
                }}
              >
                {!isCollapsed && (
                  <Box display={"flex"}>
                    {item.icon}
                    <Typography ml={1} fontSize={18} color="white" textAlign="start">
                      {item.title}
                    </Typography>
                  </Box>
                )}
              </Button>
            ))}
          </List>
        </Box>

        {!isCollapsed && <Box display={"flex"} justifyContent={"center"} color={'white'} alignItems={"center"} flexDirection={"column"} pt={1} borderTop={"1px solid white"}>
          <Typography>Desenvolvido por:</Typography>
          <Typography fontSize={16} textTransform={"uppercase"}>Inovação & Melhoria</Typography>
        </Box>}


      </Box>
    </Drawer >
  );
};

export default Sidebar;
