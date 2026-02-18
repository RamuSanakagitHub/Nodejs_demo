// const jwt = require("jsonwebtoken");

// exports.verifyToken = (req, res, next) => {

//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ message: "Access Denied" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const verified = jwt.verify(token, process.env.JWT_SECRET);

//     req.user = verified;  // { id, role }

//     next();

//   } catch (error) {
//     return res.status(401).json({ message: "Invalid Token" });
//   }
// };

const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET); // Use access secret
    req.user = verified; // { id, role }
    next();
  } catch (error) {
    // Token expired or invalid
    return res.status(401).json({ message: "Access token expired or invalid. Please refresh your tokens." });
  }
};
