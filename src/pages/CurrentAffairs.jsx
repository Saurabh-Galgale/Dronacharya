import React, { useState, useRef, useEffect } from "react";

import { Viewer, Worker, SpecialZoomLevel } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";

const MONTHS = ["ऑक्टोबर", "नोव्हेंबर", "डिसेंबर"];

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

const MAGAZINE_DATA = {
  ऑक्टोबर:
    "https://k%2FzHThxGxjmMyShUhfKIJm8%2BmSBJjZ2ZXlcSuJFSLrBFVwp6nfni%2BWNJTgNgQc6NS4gZQhmJ6BTBLhCgtJfHz63CQ%2BV536VZAxXUUf2k%2BHadWK9w5My5GMlBOy30ttXgVZXvjBen5ids9Kv6oSgOA5LE4AOtRbRQr4Ezfou7AYCGrJgYTCg2t%2B2PZYn14Lxyhde3GXVef6jeUiSROw0Kx5ptJdlVVerGfNg0w1Ym6ygY63wIfZVos%2BR2Pg9KiDmoSeklRz44xADedwAwf%2FkjXDBaaqpNBAUghJBChjLhnu2pD4IuAYl1S7CSpPh%2FQjHoZ%2F1ac5ZYsjRWfCVk%2FUJTt5QfZbyXALdLECviv402eTwYMqSPIBtx6T0SkaIxY%2BdLMZTLc%2ByeqRtpD0b3z%2BlTsLIkH3jc7Vkkm4gnyVuv1put0J20ZzB5NDJVxBngF3Zcz%2FSBvlaYuIGTbeAPVds4xixhjaB3c5vQZMhCwQRXsA8MG5u8ONsxI1hVUtrlyGrTk0H1xtjSgDsCW5OB7EtmNEBhyG5rORCan1KAhjsc1tUnWUyc9wHGhy5rExXd0upYFtmRaBWgYo0VTFQ%2B6cj24wMGppwVonultixRTpsU%2BMk5jNkcTDzFyE4PGewWZUyKh6XSEfBy4FA",
  नोव्हेंबर:
    "https://wN80zRFJDPvHHUsA1y19CfPUvWO%2Fis4om5cMrSS0ubglsoNq0lGC7uu%2FgAKKL5XLhzcTnkBZM6ZMzvd%2BjEXHWvpwJkVk5bhi5PdBiT5gszmso1Xr41RtvEB48WvhPq9%2BYDwInjU5jHikgX3%2BsZ8MbmPMLHdvS2eNE4GS7xISYvY36HYLm4nW2MDL%2F9jqt8nF9GWIT81mAFzv38x6rSthZbp4h4TziC5TuoyLll09vjZbyZLU7b7eRy4VjPu%2Bf8XXPigqKZ8QTMsDDvmbTKBjrdArn6i1hT1pROvo%2B%2FoGOxodcPnxxddnw0MNA%2FX5h2oZyp9ibN8aUmU9UQJBeSmHrb1jekYZ85AeqOCJDbppe10HhB6eFPOvnGBVZdnG%2FTsFJ8TrVdqkuRtG%2FAXaVaga943oeOR9ZcRqogL1foPsDbvcefRlqCWZVvQ5TTf6XxghvH6Ucy%2BNjpZHbh17PklnsUYxxVprAlvlg%2FLb8t%2FHiprT4cuuds%2FiO2gBBufeMee1uzxCzOiAoS1JfkDDdhP%2BbPR6sNhUeMladBZVjxaY227p9jRDZSzwl8NiFudj9L4VbmBJAraxmpApRYUc9sL0cacW3bCTSCbRGgJCGtWC%2BUCTPb34QSi3kGXk4u%2Bh6YfoIbaxpm9VaddxZqoKug1%2BGiZD%2FOnRe31gtfhr2WALpeEShkXztnmJlyAmtRG2eN%2BH4uEpx7UImltP23pmLxtJJZzihLZUR5j9ErstTRyio%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5N4CGGRWTVOGDPSL%2F20251225%2Fap-south-1%2Fs3%2Faws",
  डिसेंबर:
    "https://RtvEB48WvhPq9%2BYDwInjU5jHikgX3%2BsZ8MbmPMLHdvS2eNE4GS7xISYvY36HYLm4nW2MDL%2F9jqt8nF9GWIT81mAFzv38x6rSthZbp4h4TziC5TuoyLll09vjZbyZLU7b7eRy4VjPu%2Bf8XXPigqKZ8QTMsDDvmbTKBjrdArn6i1hT1pROvo%2B%2FoGOxodcPnxxddnw0MNA%2FX5h2oZyp9ibN8aUmU9UQJBeSmHrb1jekYZ85AeqOCJDbppe10HhB6eFPOvnGBVZdnG%2FTsFJ8TrVdqkuRtG%2FAXaVaga943oeOR9ZcRqogL1foPsDbvcefRlqCWZVvQ5TTf6XxghvH6Ucy%2BNjpZHbh17PklnsUYxxVprAlvlg%2FLb8t%2FHiprT4cuuds%2FiO2gBBufeMee1uzxCzOiAoS1JfkDDdhP%2BbPR6sNhUeMladBZVjxaY227p9jRDZSzwl8NiFudj9L4VbmBJAraxmpApRYUc9sL0cacW3bCTSCbRGgJCGtWC%2BUCTPb34QSi3kGXk4u%2Bh6YfoIbaxpm9VaddxZqoKug1%2BGiZD%2FOnRe31gtfhr2WALpeEShkXztnmJlyAmtRG2eN%2BH4uEpx7UImltP23pmLxtJJZzihLZUR5j9ErstTRyio%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA5N4CGGRWTVOGDPSL%2F20251225%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20251225T103524Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=e0",
};

const MagazineCard = ({
  month,
  isOpen,
  onToggle,
  onOpenPdf,
  index,
  imageUrl,
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
      ref={cardRef}
      style={{
        marginBottom: "24px",
        width: "100%",
        perspective: "2000px", // Increased perspective for smoother flip
        // We set a height that fits a standard mobile screen but allows scroll
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
        {/* FRONT CARD - Stay Absolute */}
        <div
          style={{
            position: "absolute",
            inset: 0, // Fill the container
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
              २०२५
            </span>
          </div>
          <div style={{ padding: "0 24px 24px" }}>
            <h2
              style={{ fontSize: "32px", fontWeight: 900, marginBottom: "8px" }}
            >
              {month}
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

        {/* BACK CARD - Perfect Flip & Perfect Fit */}
        <div
          style={{
            position: "absolute",
            inset: 0, // Fill the container
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
          {/* Header */}
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
              {month} २०२५
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

          {/* Image Container - This now fits width perfectly */}
          <div style={{ flex: 1, overflowY: "auto", backgroundColor: "#fff" }}>
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={`${month} cover`}
                style={{
                  width: "100%", // Force width fit
                  height: "auto", // Natural height
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

            {/* Buttons positioned inside scroll if image is too long, 
                or pinned to bottom via flex */}
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
                  onOpenPdf(month);
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
  const [openMonthIndex, setOpenMonthIndex] = useState(null);
  const [openReader, setOpenReader] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");

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
      {/* ... (Your existing Header and Mapping) */}

      {MONTHS.map((month, index) => (
        <MagazineCard
          key={index}
          month={month}
          index={index}
          imageUrl={MAGAZINE_DATA[month]}
          isOpen={openMonthIndex === index}
          onToggle={() =>
            setOpenMonthIndex(openMonthIndex === index ? null : index)
          }
          onOpenPdf={(m) => {
            setSelectedMonth(m);
            setOpenReader(true);
          }}
        />
      ))}

      {/* FULL SCREEN PDF READER */}
      {openReader && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#1a1a1a", // Your original dark background
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
              {selectedMonth} २०२५
            </h2>
          </div>

          {/* This is the part we fix to render the PDF */}
          <div
            style={{
              flex: 1,
              position: "relative",
              backgroundColor: "#525659",
            }}
          >
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
              <Viewer
                // Point this to your assets.
                // If "ऑक्टोबर" is clicked, it looks for /assets/pdfs/ऑक्टोबर.pdf
                fileUrl={`/images/sample.pdf`}
                defaultScale={SpecialZoomLevel.PageWidth}
              />
            </Worker>
          </div>
        </div>
      )}
    </div>
  );
};

export default MagazinePage;
