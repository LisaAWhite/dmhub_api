import InvalidApiToken from "../errors/InvalidApiToken.js";
import logger from "../index.js";

export function verifyToken(req, res, next) {
  const token = process.env.token || "t0k3n";
  console.log(token);
  
  if (req.query.apiToken !== token) {
    const error = new InvalidApiToken();
    logger.error(error.message);
    console.log(`API Token: ${req.query.apiToken}`);
    logger.error(`API Token: ${req.query.apiToken}`);
    return res.status(403).send({ error: error.message });
  }

  next();
}

export default verifyToken;