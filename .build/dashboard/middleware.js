"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = () => {
    return (req, res, next) => {
        console.log("Middleware executed");
        // Example validation
        if (!req.headers["authorization"]) {
            return res.status(401).json({
                message: "Unauthorized",
            });
        }
        next();
    };
};
//# sourceMappingURL=middleware.js.map