import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#fdfdfd", // off-white instead of pure white
    },
    secondary: {
      main: "#de6925", // base for gradient
    },
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "'Gotu', sans-serif",
  },
  components: {
    MuiCard: {
      variants: [
        {
          props: { variant: "stats" },
          style: {
            textAlign: "center",
            padding: "16px 0",
            backgroundColor: "rgba(255,255,255,0.9)",
            boxShadow: "0px 2px 8px rgba(88, 84, 84, 0.05)",
          },
        },
      ],
    },
    // MuiCard: {
    //   styleOverrides: {
    //     root: {
    //       borderRadius: 12,
    //       boxShadow: "0px 2px 8px rgba(0,0,0,0.05)",
    //     },
    //   },
    // },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          background: "linear-gradient(135deg, #de6925, #f8b14a)",
          color: "#fff",
          "&:hover": {
            background: "linear-gradient(135deg, #c9571e, #e0a03e)",
          },
        },
      },
    },
  },
});

export default theme;
