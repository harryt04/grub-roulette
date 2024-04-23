import { Typography, Button } from "@mui/material";
export default function Home() {
  return (
    <div>
      <Typography variant="h1">hello world</Typography>
      <Button variant="contained" disabled>
        Use current location
      </Button>
    </div>
  );
}
