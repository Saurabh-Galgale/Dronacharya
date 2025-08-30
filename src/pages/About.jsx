import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  Grid,
} from "@mui/material";

const team = [
  {
    name: "अमित गोळे",
    role: "संस्थापक",
    description:
      "अनेक संकटांचा सामना करत मी इथे पोहोचलो आहे — हार मानली नाही, झुंज दिली. गुन्हेगारीच्या सावल्यांमध्ये काम करताना धैर्य, संयम आणि अनुभव मिळवला. आज मी तुमच्यासमोर एक मार्गदर्शक म्हणून उभा आहे — तुमचे स्वप्न माझे ध्येय. पोलीस भरतीचा प्रवास तुमच्यासाठी सोपा करणे, हेच माझे पुढचे मिशन आहे.",
    avatar: "https://i.pravatar.cc/150?img=1", // placeholder avatar
  },
];

const About = () => {
  return (
    <Box sx={{ py: 6, px: 3, textAlign: "center" }}>
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        आमच्याबद्दल
      </Typography>
      <Typography variant="h6" color="text.secondary" mb={5}>
        या प्रकल्पामागील आमची टीम
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        {team.map((member, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
              sx={{
                p: 3,
                borderRadius: "20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                },
              }}
            >
              <Avatar
                src={member.avatar}
                alt={member.name}
                sx={{
                  width: 100,
                  height: 100,
                  mx: "auto",
                  mb: 2,
                  border: "3px solid #1976d2",
                }}
              />
              <CardContent>
                <Typography variant="h6" fontWeight="bold">
                  {member.name}
                </Typography>
                <Typography variant="subtitle1" color="primary" gutterBottom>
                  {member.role}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {member.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default About;
