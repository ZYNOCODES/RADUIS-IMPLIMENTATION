const { rateLimit } = require("express-rate-limit");
const CustomError = require('../util/CustomError');

const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minutes
    limit: 20, // each IP can make up to 60 requests per `windowsMs` (1 minutes)
    standardHeaders: true, // add the `RateLimit-*` headers to the response
    legacyHeaders: false, // remove the `X-RateLimit-*` headers from the response
    skipFailedRequests: true,
    handler: (req, res, next, options) => {
        const error = new CustomError('Trop de demandes, veuillez réessayer plus tard après 1 minute.', 429);
        next(error);
    },
});

module.exports = limiter;