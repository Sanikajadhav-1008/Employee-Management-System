import jwt from "jsonwebtoken";

/**
 * verifyToken – validates the JWT from the Authorization header or cookie.
 * Attach the decoded payload to req.user.
 */
const verifyToken = (req, res, next) => {
  // Support both cookie-based and Bearer-token auth
  const token =
    req.cookies?.token ||
    (req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : null);

  if (!token) {
    return res.status(401).json({ Status: false, Error: "Not authenticated" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "ems_secret_key");
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ Status: false, Error: "Invalid or expired token" });
  }
};

export default verifyToken;
