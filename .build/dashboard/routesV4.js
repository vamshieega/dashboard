"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const controller_1 = require("./controller");
exports.default = () => {
    const router = (0, express_1.Router)();
    // global middleware
    //   router.use(Middleware());
    // routes
    router.get("/", 
    // authorizeUser,
    controller_1.getDashboard);
    router.get("/users", 
    // authorizeUser,
    controller_1.getUsers);
    router.get("/notes", 
    // authorizeUser,
    controller_1.getNotes);
    router.post("/notes", 
    // authorizeUser,
    controller_1.createNote);
    router.delete("/notes/:id", 
    // authorizeUser,
    controller_1.deleteNote);
    return router;
};
//# sourceMappingURL=routesV4.js.map