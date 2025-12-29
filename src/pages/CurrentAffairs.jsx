import React, { useState, useRef, useEffect } from "react";
import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import { getMagazines, getMagazineById } from "../services/api"; // Assuming getMagazineById is also in api.js
import Quiz from "../component/Quiz"; // Assuming Quiz component is in component folder

const gradients = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)",
  "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
  "linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
];

const MagazineCard = ({
  magazine,
  isOpen,
  onToggle,
  onOpenPdf,
  onOpenQuiz,
  index,
}) => {
  const cardRef = useRef(null);

  useEffect(() => {
    if (isOpen && cardRef.current) {
      setTimeout(() => {
        cardRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 350);
    }
  }, [isOpen]);

  const gradient = gradients[index % gradients.length];

  return (
    <div
      className="magazine-card"
      ref={cardRef}
      style={{
        marginBottom: "24px",
        width: "100%",
        perspective: "2000px",
        height: isOpen ? "750px" : "180px",
        transition: "height 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <div
        onClick={onToggle}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isOpen ? "rotateY(180deg)" : "rotateY(0deg)",
          cursor: "pointer",
        }}
      >
        {/* FRONT CARD */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            background: gradient,
            color: "white",
            borderRadius: "24px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
            overflow: "hidden",
            zIndex: 2,
          }}
        >
          <div style={{ padding: "24px" }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 12px",
                backgroundColor: "rgba(255, 255, 255, 0.25)",
                color: "white",
                fontWeight: 600,
                borderRadius: "12px",
                fontSize: "13px",
              }}
            >
              {magazine.year}
            </span>
          </div>
          <div style={{ padding: "0 24px 24px" }}>
            <h2
              style={{ fontSize: "32px", fontWeight: 900, marginBottom: "8px" }}
            >
              {magazine.month}
            </h2>
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
                opacity: 0.9,
              }}
            >
              <span>📚</span>
              <span style={{ fontSize: "14px" }}>मासिक संकलन</span>
            </div>
          </div>
        </div>

        {/* BACK CARD */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            display: "flex",
            flexDirection: "column",
            borderRadius: "24px",
            backgroundColor: "#ffffff",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              background: gradient,
              color: "#fff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexShrink: 0,
            }}
          >
            <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 700 }}>
              {magazine.month} {magazine.year}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                color: "white",
                width: "30px",
                height: "30px",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>

          <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#fff" }}>
            {magazine.coverUrl ? (
              <img
                src={magazine.coverUrl}
                alt={`${magazine.month} cover`}
                style={{
                  width: "100%",
                  height: "auto",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{ padding: "40px", textAlign: "center", color: "#999" }}
              >
                फोटो उपलब्ध नाही
              </div>
            )}

            <div
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenPdf(magazine._id);
                }}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "14px",
                  background: gradient,
                  border: "none",
                  color: "white",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "16px",
                }}
              >
                📈 पूर्ण वाचा
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenQuiz(magazine._id);
                }}
                style={{
                  width: "100%",
                  padding: "16px",
                  borderRadius: "14px",
                  background: "#f8f9fa",
                  border: "1px solid #e0e0e0",
                  color: "#333",
                  fontWeight: 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  fontSize: "16px",
                }}
              >
                📝 मॅगझिन आधारित प्रश्न
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MagazinePage = () => {
  const [magazines, setMagazines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openMonthIndex, setOpenMonthIndex] = useState(null);
  const [openReader, setOpenReader] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [selectedMagazineId, setSelectedMagazineId] = useState(null);
  const [isQuizOpen, setIsQuizOpen] = useState(false);

  useEffect(() => {
    const fetchMagazines = async () => {
      try {
        const cachedData = localStorage.getItem("magazines");
        if (cachedData) {
          const { timestamp, data } = JSON.parse(cachedData);
          const isCacheValid = (new Date().getTime() - timestamp) / (1000 * 60 * 60 * 24) < 7;
          if (isCacheValid) {
            setMagazines(data);
            setIsLoading(false);
            return;
          }
        }

        const data = await getMagazines();
        setMagazines(data.magazines);
        localStorage.setItem("magazines", JSON.stringify({ timestamp: new Date().getTime(), data: data.magazines }));
      } catch (_error) {
        setError("Failed to load magazines. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchMagazines();
  }, []);

  const handleOpenPdf = async (magazineId) => {
    try {
      const magazine = await getMagazineById(magazineId);
      setPdfUrl(magazine.magazineUrl);
      setOpenReader(true);
    } catch (_error) {
      setError("Failed to load magazine PDF.");
    }
  };

  const handleOpenQuiz = (magazineId) => {
    setSelectedMagazineId(magazineId);
    setIsQuizOpen(true);
  };

  if (isLoading) {
    return <div>Loading magazines...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        paddingBottom: "50px",
        marginLeft: 12,
        marginRight: 12,
      }}
    >
      {magazines.map((magazine, index) => (
        <MagazineCard
          key={magazine._id}
          magazine={magazine}
          index={index}
          isOpen={openMonthIndex === index}
          onToggle={() =>
            setOpenMonthIndex(openMonthIndex === index ? null : index)
          }
          onOpenPdf={handleOpenPdf}
          onOpenQuiz={handleOpenQuiz}
        />
      ))}

      {openReader && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#1a1a1a",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              padding: "16px",
              backgroundColor: "#000",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <button
              onClick={() => setOpenReader(false)}
              style={{
                background: "none",
                border: "none",
                color: "white",
                fontSize: "24px",
                cursor: "pointer",
              }}
            >
              ←
            </button>
            <h2 style={{ margin: 0, fontSize: "18px" }}>
              Magazine
            </h2>
          </div>

          <div
            style={{
              flex: 1,
              position: "relative",
              backgroundColor: "#525659",
            }}
          >
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer
                fileUrl={pdfUrl}
                defaultScale={SpecialZoomLevel.PageWidth}
              />
            </Worker>
          </div>
        </div>
      )}

      {isQuizOpen && (
        <Quiz
          magazineId={selectedMagazineId}
          onClose={() => setIsQuizOpen(false)}
        />
      )}
    </div>
  );
};

export default MagazinePage;
