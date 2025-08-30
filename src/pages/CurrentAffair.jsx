import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, Grid } from "@mui/material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import logo from "/images/logo.jpeg";

const topics = [
  "राष्ट्रीय घडामोडी",
  "आंतरराष्ट्रीय घडामोडी",
  "अर्थव्यवस्था",
  "विज्ञान व तंत्रज्ञान",
  "पर्यावरण",
  "क्रीडा",
  "पुरस्कार",
  "संरक्षण व सुरक्षा",
  "शासकीय योजना",
  "नियुक्ती आणि पदे",
  "महाराष्ट्र",
];

const topicQueryMap = {
  "राष्ट्रीय घडामोडी": "India politics",
  "आंतरराष्ट्रीय घडामोडी": "world news",
  अर्थव्यवस्था: "India economy business finance",
  "विज्ञान व तंत्रज्ञान": "India science technology",
  पर्यावरण: "India environment climate",
  क्रीडा: "India sports",
  पुरस्कार: "India awards prize",
  "संरक्षण व सुरक्षा": "India defence security",
  "शासकीय योजना": "India government schemes",
  "नियुक्ती आणि पदे": "India appointments positions",
  महाराष्ट्र: "Maharashtra state news",
};

// 🔹 Loading dots
function LoadingDots() {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);
    return () => clearInterval(interval);
  }, []);
  return <span>{dots}</span>;
}

export default function CurrentAffairs() {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const fetchCurrentAffairs = async (topic) => {
    setSelectedTopic(topic);
    setLoading(true);
    setContent("");

    try {
      const query = topicQueryMap[topic] || "India";
      const gnewsRes = await fetch(
        `https://gnews.io/api/v4/top-headlines?token=${
          import.meta.env.VITE_GNEWS_API_KEY
        }&q=${encodeURIComponent(query)}&lang=en&country=in&max=12`
      );
      const gnewsData = await gnewsRes.json();

      if (!gnewsData.articles || gnewsData.articles.length === 0) {
        setContent("⚠️ या महिन्यातील कोणतीही ताजी बातमी मिळाली नाही.");
        setLoading(false);
        return;
      }

      const headlines = gnewsData.articles
        .map(
          (a, i) =>
            `${i + 1}. ${a.title} - ${a.description || ""} (${a.source.name})`
        )
        .join("\n\n");

      const aiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content:
                "तुम्ही स्पर्धा परीक्षांसाठी करंट अफेयर्स तयार करणारे तज्ञ आहात. नेहमीच माहिती मराठीत द्या. 10 महत्त्वाच्या बातम्यांची मथळे लिहा आणि प्रत्येक मथळ्याखाली 4 - 5 ओळींचे छोटे स्पष्टीकरण द्या. माहिती नेमकी, तथ्याधारित आणि परीक्षाभिमुख असावी.",
            },
            {
              role: "user",
              content: `या बातम्यांवर आधारित "${topic}" विषयाचे या महिन्यातील Current Affairs तयार करा:\n\n${headlines}`,
            },
          ],
        }),
      });

      const aiData = await aiRes.json();
      const reply =
        aiData.choices?.[0]?.message?.content || "⚠️ प्रतिसाद मिळाला नाही";
      setContent(reply);
    } catch (err) {
      console.error(err);
      setContent("❌ सामग्री आणताना त्रुटी आली.");
    }

    setLoading(false);
  };

  return (
    <Box sx={{ p: 2, position: "relative", minHeight: "80vh" }}>
      <Typography variant="h5" fontWeight="bold" mb={2}>
        📌 विषयानुसार करंट अफेयर्स
      </Typography>

      {/* 🔹 विषयांची यादी in grid */}
      <Grid container spacing={2} xs={8} mb={3}>
        {topics.map((t) => (
          <Grid item xs={6} sm={4} md={3} key={t}>
            <Button
              fullWidth
              variant={selectedTopic === t ? "contained" : "outlined"}
              onClick={() => fetchCurrentAffairs(t)}
              disabled={loading}
              sx={{ textAlign: "center", py: 1.5 }}
            >
              {t}
            </Button>
          </Grid>
        ))}
      </Grid>

      {/* 🔹 Custom Loading Screen */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            bgcolor: "rgba(255,255,255,0.9)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <img src={logo} alt="Logo" style={{ width: 180, marginBottom: 20 }} />
          <Typography variant="h6" fontWeight="bold">
            लोड होत आहे
            <LoadingDots />
          </Typography>
        </Box>
      )}

      {/* 🔹 सुरुवातीची सूचना */}
      {!loading && !content && !selectedTopic && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <Typography variant="h6" color="text.secondary">
            वरील कुठल्याही विषयावर क्लिक करा
          </Typography>
        </Box>
      )}

      {/* 🔹 Content */}
      {!loading && content && (
        <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2 }}>
          <Typography variant="h6" gutterBottom>
            {selectedTopic} – शीर्ष मथळे
          </Typography>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </Paper>
      )}
    </Box>
  );
}
