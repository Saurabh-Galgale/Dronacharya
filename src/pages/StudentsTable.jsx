import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Tooltip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import mockUsers from "../mockUsers.js";

const StudentsTable = () => {
  return (
    <Paper sx={{ mt: 4, p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
        📋 विद्यार्थी सूचि
      </Typography>

      {/* 🔹 Scrollable wrapper */}
      <TableContainer sx={{ maxHeight: "100%", overflowY: "auto" }}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: "#f5f5f5" }}>
              <TableCell>
                <b>ID</b>
              </TableCell>
              <TableCell>
                <b>Name</b>
              </TableCell>
              <TableCell>
                <b>Email</b>
              </TableCell>
              <TableCell>
                <b>Phone</b>
              </TableCell>
              {/* <TableCell>
                <b>Department</b>
              </TableCell>
              <TableCell>
                <b>Designation</b>
              </TableCell>
              <TableCell align="right">
                <b>Salary</b>
              </TableCell> */}
              <TableCell align="center">
                <b>Favorite</b>
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {mockUsers.map((user) => (
              <TableRow key={user.id} hover>
                <TableCell>{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.phone}</TableCell>
                {/* <TableCell>{user.department}</TableCell> */}
                {/* <TableCell>{user.designation}</TableCell> */}
                {/* <TableCell align="right">₹{user.salary}</TableCell> */}
                <TableCell align="center">
                  <Tooltip title={user.favorite ? "Favorite" : "Not Favorite"}>
                    <IconButton color={user.favorite ? "warning" : "default"}>
                      {user.favorite ? <StarIcon /> : <StarBorderIcon />}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default StudentsTable;
