import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  IconButton,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DeleteIcon from "@mui/icons-material/Delete";
import UploadFileIcon from "@mui/icons-material/UploadFile";

// small animated dots component
const LoadingDots = () => (
  <span style={{ display: "inline-block", marginLeft: 8 }}>
    <span className="dot">.</span>
    <span className="dot">.</span>
    <span className="dot">.</span>
    <style>{`
      .dot { animation: blink 1.5s infinite; font-size: 20px; }
      .dot:nth-child(2) { animation-delay: 0.2s; }
      .dot:nth-child(3) { animation-delay: 0.4s; }
      @keyframes blink {
        0%,20% { opacity: 0 } 50% { opacity: 1 } 100% { opacity: 0 }
      }
    `}</style>
  </span>
);

const Notes = () => {
  // lazy init from localStorage so we don't overwrite saved data on mount
  const [folders, setFolders] = useState(() => {
    try {
      const raw = localStorage.getItem("folders");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.error("Failed to parse folders from localStorage", e);
      return [];
    }
  });

  const [currentFolder, setCurrentFolder] = useState(null);
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);

  // delete confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // {type: 'file'|'folder', name}

  const logo = "/images/logo.jpeg"; // change to your logo path

  // persist folders -> localStorage (with try/catch for quota)
  useEffect(() => {
    try {
      localStorage.setItem("folders", JSON.stringify(folders));
    } catch (err) {
      console.error("Failed saving to localStorage", err);
      alert(
        "फाईल्स सेव्ह करताना अडचण आली — localStorage भरलेले असू शकते. फाईल लहान करा किंवा IndexedDB वापरावे."
      );
    }
  }, [folders]);

  // create folder
  const createFolder = () => {
    const name = folderName.trim();
    if (!name) return;
    if (folders.some((f) => f.name === name)) {
      alert("आवश्यक फोल्डर आधीच आहे.");
      return;
    }
    setFolders((prev) => [...prev, { name, files: [] }]);
    setFolderName("");
  };

  // file -> base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });

  // upload PDF(s)
  const handleFileUpload = async (e) => {
    if (!currentFolder) return;
    const list = e.target.files || [];
    if (!list.length) return;

    setLoading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(list).map(async (file) => ({
          name: file.name,
          base64: await fileToBase64(file),
        }))
      );

      // simple safety check: total base64 string length — warn if too big for localStorage
      const totalBase64Length = uploaded.reduce(
        (acc, f) => acc + (f.base64 ? f.base64.length : 0),
        0
      );
      // conservative threshold (base64 length units). Adjust if desired.
      if (totalBase64Length > 6_000_000) {
        alert(
          "Selected files are too large to store in localStorage. Use smaller files or ask me to switch this to IndexedDB."
        );
        setLoading(false);
        e.target.value = "";
        return;
      }

      setFolders((prev) =>
        prev.map((folder) =>
          folder.name === currentFolder
            ? { ...folder, files: [...folder.files, ...uploaded] }
            : folder
        )
      );
    } catch (err) {
      console.error("Upload error", err);
      alert("फाईल वाचताना त्रुटी आली.");
    } finally {
      setLoading(false);
      // reset input so same file can be selected again
      e.target.value = "";
    }
  };

  // open confirmation dialog
  const handleDeleteClick = (type, name) => {
    setDeleteTarget({ type, name });
    setConfirmOpen(true);
  };

  // confirm deletion
  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "file") {
      setFolders((prev) =>
        prev.map((folder) =>
          folder.name === currentFolder
            ? {
                ...folder,
                files: folder.files.filter((f) => f.name !== deleteTarget.name),
              }
            : folder
        )
      );
    } else if (deleteTarget.type === "folder") {
      setFolders((prev) => prev.filter((f) => f.name !== deleteTarget.name));
      if (currentFolder === deleteTarget.name) {
        setCurrentFolder(null);
      }
    }

    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  // files in current folder (always read from state)
  const currentFiles =
    folders.find((folder) => folder.name === currentFolder)?.files || [];

  return (
    <Box sx={{ py: 6, px: 3, position: "relative" }}>
      {/* Loading overlay */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(255,255,255,0.9)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
        >
          <img src={logo} alt="Logo" style={{ width: 120, marginBottom: 20 }} />
          <Typography variant="h6" fontWeight="bold">
            लोड होत आहे <LoadingDots />
          </Typography>
        </Box>
      )}

      {/* confirmation */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            तुम्हाला खरंच {deleteTarget?.type === "folder" ? "फोल्डर" : "फाईल"}{" "}
            <b>{deleteTarget?.name}</b> हटवायची आहे का?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>रद्द करा</Button>
          <Button color="error" onClick={confirmDelete} autoFocus>
            हटवा
          </Button>
        </DialogActions>
      </Dialog>

      <Typography variant="h3" fontWeight="bold" gutterBottom>
        📂 नोट्स
      </Typography>

      {/* create folder */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          label="फोल्डरचे नाव"
          value={folderName}
          onChange={(e) => setFolderName(e.target.value)}
          size="small"
        />
        <Button variant="contained" onClick={createFolder}>
          फोल्डर तयार करा
        </Button>
      </Box>

      {/* folders grid */}
      {!currentFolder ? (
        <Grid container spacing={3}>
          {folders.length === 0 && (
            <Box sx={{ px: 2 }}>
              कोणतेही फोल्डर नाहीत — नवीन फोल्डर तयार करा.
            </Box>
          )}
          {folders.map((folder, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card
                sx={{
                  p: 3,
                  textAlign: "center",
                  cursor: "pointer",
                  position: "relative",
                  "&:hover": { backgroundColor: "#f5f5f5" },
                }}
              >
                <IconButton
                  sx={{ position: "absolute", top: 5, right: 5 }}
                  color="error"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick("folder", folder.name);
                  }}
                >
                  <DeleteIcon />
                </IconButton>

                <div
                  onClick={() => {
                    setCurrentFolder(folder.name);
                  }}
                >
                  <FolderIcon sx={{ fontSize: 60, color: "#1976d2" }} />
                  <Typography variant="h6">{folder.name}</Typography>
                  <Typography variant="body2">
                    {folder.files.length} फाईल्स
                  </Typography>
                </div>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <>
          <Button onClick={() => setCurrentFolder(null)}>⬅ मागे जा</Button>

          {/* upload */}
          <Box mt={2} mb={2}>
            <Button
              component="label"
              variant="outlined"
              startIcon={<UploadFileIcon />}
            >
              Upload PDF
              <input
                type="file"
                accept="application/pdf"
                hidden
                multiple
                onChange={handleFileUpload}
              />
            </Button>
          </Box>

          {/* files */}
          <Grid container spacing={3}>
            {currentFiles.length === 0 && (
              <Box sx={{ px: 2 }}>या फोल्डरमध्ये अजून फाइल्स नाहीत.</Box>
            )}
            {currentFiles.map((file, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Card sx={{ p: 2, textAlign: "center" }}>
                  <InsertDriveFileIcon sx={{ fontSize: 50, color: "grey" }} />
                  <Typography variant="body1">{file.name}</Typography>
                  <Box mt={1}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => {
                        try {
                          // convert base64 string → Blob → ObjectURL
                          const byteString = atob(file.base64.split(",")[1]);
                          const ab = new ArrayBuffer(byteString.length);
                          const ia = new Uint8Array(ab);
                          for (let i = 0; i < byteString.length; i++) {
                            ia[i] = byteString.charCodeAt(i);
                          }
                          const blob = new Blob([ab], {
                            type: "application/pdf",
                          });
                          const url = URL.createObjectURL(blob);
                          window.open(url, "_blank");
                        } catch (err) {
                          alert("PDF उघडताना त्रुटी आली.");
                          console.error(err);
                        }
                      }}
                    >
                      उघडा
                    </Button>

                    <IconButton
                      color="error"
                      onClick={() => handleDeleteClick("file", file.name)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}
    </Box>
  );
};

export default Notes;
