import { Router } from "express";
import Middleware from "./middleware";
import { createNote, deleteNote, getDashboard, getNotes, getUsers } from "./controller";

export default () => {
  const router = Router();

  // global middleware
//   router.use(Middleware());

  // routes
  router.get(
    "/",
    // authorizeUser,
    getDashboard
  );

  router.get(
    "/users",
    // authorizeUser,
    getUsers
  );

  router.get(
    "/notes",
    // authorizeUser,
    getNotes
  );

  router.post(
    "/notes",
    // authorizeUser,
    createNote
  );

  router.delete(
    "/notes/:id",
    // authorizeUser,
    deleteNote
  );
  return router;
};