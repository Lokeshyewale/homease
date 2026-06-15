// import React, { useEffect } from "react";
// import { Descope, useSession } from "@descope/react-sdk";
// import { useNavigate } from "react-router-dom";

// const Auth = () => {
//   const { isAuthenticated } = useSession();
//   const navigate = useNavigate();

//   useEffect(() => {
//     console.log("Auth status:", isAuthenticated); // Debugging line

//     if (isAuthenticated) {
//       navigate("/"); // Forcefully replace /auth with /
//     }
//   }, [isAuthenticated, navigate]);

//   return (
//     <div>
//       <h2>Login / Sign Up</h2>
//       <Descope flowId="sign-in-enchanted-link-social-mfa-with-otp" />
//     </div>
//   );
// };

// export default Auth;
