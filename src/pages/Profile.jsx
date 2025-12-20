import React from "react";

const Profile = () => {
  return <div>Profile</div>;
};

export default Profile;

// // src/pages/ProfileCard.jsx
// import React, { useState, useEffect } from "react";
// import {
//   Avatar,
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Divider,
//   Stack,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   TextField,
// } from "@mui/material";
// import { useNavigate } from "react-router-dom";
// import {
//   getStoredUserProfile,
//   setStoredUserProfile,
//   getUserFromToken,
// } from "../services/authService";

// const DEFAULT_AVATAR =
//   "https://png.pngtree.com/png-clipart/20250104/original/pngtree-smiling-male-avatar-with-glasses-and-stylish-mustache-for-profile-icons-png-image_20072133.png";

// const ProfileCard = () => {
//   const navigate = useNavigate();
//   const [profile, setProfile] = useState(null);
//   const [open, setOpen] = useState(false);

//   // Initialize profile once (minimal, optimized)
//   useEffect(() => {
//     let user = getStoredUserProfile();

//     if (!user) {
//       const tokenUser = getUserFromToken();

//       if (tokenUser) {
//         user = {
//           id: tokenUser.id || null,
//           name: tokenUser.name || tokenUser.fullName || "",
//           email: tokenUser.email || "",
//           phone: "",
//           picture: tokenUser.picture || DEFAULT_AVATAR,
//           role: tokenUser.role || tokenUser.userType || "STUDENT",
//           canSeeBlogs: !!tokenUser.canSeeBlogs,
//           canSeeQp: !!tokenUser.canSeeQp,
//           canSeeCa: !!tokenUser.canSeeCa,
//           // server might include subscription object — keep boolean and optional due date
//           subscription: !!(
//             tokenUser.subscription && tokenUser.subscription.active
//           ),
//           subscriptionDue:
//             tokenUser.subscription && tokenUser.subscription.dueDate
//               ? tokenUser.subscription.dueDate
//               : null,
//           createdAt: tokenUser.iat
//             ? new Date(tokenUser.iat * 1000).toISOString()
//             : new Date().toISOString(),
//         };
//       } else {
//         user = {
//           id: null,
//           name: "",
//           email: "",
//           phone: "",
//           picture: DEFAULT_AVATAR,
//           role: "STUDENT",
//           canSeeBlogs: false,
//           canSeeQp: false,
//           canSeeCa: false,
//           subscription: false,
//           subscriptionDue: null,
//           createdAt: new Date().toISOString(),
//         };
//         setOpen(true);
//       }

//       // normalize image protocol
//       if (user.picture?.startsWith("//"))
//         user.picture = "https:" + user.picture;
//       if (user.picture?.startsWith("http://"))
//         user.picture = user.picture.replace(/^http:\/\//i, "https://");

//       setStoredUserProfile(user);
//     } else {
//       // ensure picture normalized and subscriptionDue exists if missing
//       if (user.picture?.startsWith("//"))
//         user.picture = "https:" + user.picture;
//       if (user.picture?.startsWith("http://"))
//         user.picture = user.picture.replace(/^http:\/\//i, "https://");
//       if (typeof user.subscription === "undefined") user.subscription = false;
//       if (!("subscriptionDue" in user)) user.subscriptionDue = null;
//     }

//     setProfile(user);
//   }, []);

//   const handleSave = () => {
//     const updated = {
//       ...profile,
//       createdAt: profile.createdAt || new Date().toISOString(),
//     };
//     setStoredUserProfile(updated);
//     setProfile(updated);
//     setOpen(false);
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setProfile((p) => ({ ...p, [name]: value }));
//   };

//   const handleAvatarError = () =>
//     setProfile((p) => ({ ...p, picture: DEFAULT_AVATAR }));

//   if (!profile) return null;

//   // Subscription status display text (Marathi)
//   const subscriptionText = profile.subscription ? "होय" : "नाही";
//   const subscriptionColor = profile.subscription
//     ? "success.main"
//     : "error.main";

//   // Format due date (Marathi locale if available)
//   let dueDateText = "-";
//   if (profile.subscriptionDue) {
//     try {
//       const d = new Date(profile.subscriptionDue);
//       dueDateText = d.toLocaleDateString("mr-IN", {
//         day: "numeric",
//         month: "short",
//         year: "numeric",
//       });
//     } catch {
//       dueDateText = profile.subscriptionDue;
//     }
//   }

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         justifyContent: "center",
//         minHeight: "90vh",
//         mt: { xs: 2, sm: 5 },
//         px: 2,
//       }}
//     >
//       <Card
//         sx={{
//           width: "100%",
//           maxWidth: 600,
//           borderRadius: 3,
//           boxShadow: 6,
//           p: { xs: 2, sm: 3 },
//           textAlign: "center",
//         }}
//       >
//         <CardContent>
//           <Avatar
//             src={profile.picture || DEFAULT_AVATAR}
//             alt={profile.name || "वापरकर्ता"}
//             onError={handleAvatarError}
//             referrerPolicy="no-referrer"
//             sx={{
//               width: 120,
//               height: 120,
//               mx: "auto",
//               mb: 2,
//               boxShadow: 3,
//             }}
//           />
//           <Typography variant="h5" fontWeight={600}>
//             {profile.name || "नाव नोंदणीकृत नाही"}
//           </Typography>

//           <Divider sx={{ my: 2 }} />

//           <Stack spacing={1} alignItems="center">
//             <Typography variant="body1">
//               <strong>ईमेल:</strong> {profile.email || "-"}
//             </Typography>
//             <Typography variant="body1">
//               <strong>फोन:</strong> {profile.phone || "-"}
//             </Typography>
//             <Typography
//               variant="body2"
//               sx={{ color: subscriptionColor, fontWeight: 600 }}
//             >
//               <strong>सदस्यता सक्रिय:</strong> {subscriptionText}
//             </Typography>
//             {profile.subscription && dueDateText && (
//               <Typography variant="body2" color="text.secondary">
//                 <strong>देय तारीख:</strong> {dueDateText}
//               </Typography>
//             )}
//             <Typography variant="body2" color="text.secondary">
//               <strong>प्रोफाइल तयार झाल्याची तारीख:</strong>{" "}
//               {new Date(profile.createdAt).toLocaleDateString("mr-IN")}
//             </Typography>
//           </Stack>
//         </CardContent>

//         <Divider sx={{ my: 2 }} />

//         <Stack direction="row" spacing={2} justifyContent="center" pb={2}>
//           <Button variant="contained" onClick={() => setOpen(true)}>
//             {profile.name ? "प्रोफाइल संपादित करा" : "प्रोफाइल पूर्ण करा"}
//           </Button>

//           {!profile.subscription && (
//             <Button
//               variant="outlined"
//               onClick={() => navigate("/app/subscription")}
//               sx={{
//                 borderColor: "primary.main",
//                 color: "primary.main",
//                 fontWeight: 600,
//               }}
//             >
//               सदस्यता घ्या
//             </Button>
//           )}
//         </Stack>
//       </Card>

//       <Dialog
//         open={open}
//         onClose={() => setOpen(false)}
//         maxWidth="sm"
//         fullWidth
//       >
//         <DialogTitle>
//           {profile.name ? "प्रोफाइल संपादित करा" : "प्रोफाइल तयार करा"}
//         </DialogTitle>
//         <DialogContent dividers>
//           <Stack spacing={2} mt={1}>
//             <TextField
//               label="पूर्ण नाव"
//               name="name"
//               value={profile.name}
//               onChange={handleChange}
//               fullWidth
//             />
//             <TextField
//               label="ईमेल"
//               name="email"
//               value={profile.email}
//               onChange={handleChange}
//               fullWidth
//             />
//             <TextField
//               label="फोन"
//               name="phone"
//               value={profile.phone}
//               onChange={handleChange}
//               fullWidth
//             />
//           </Stack>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setOpen(false)} color="inherit">
//             रद्द करा
//           </Button>
//           <Button onClick={handleSave} variant="contained">
//             जतन करा
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default ProfileCard;
