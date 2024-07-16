import express from "express";
const router = express.Router();
import notesController from "../controllers/notesController";
import verifyJWT from "../middleware/verifyJWT";

router.use(verifyJWT);

router
  .route("/")
  .get(notesController.getAllNotes)
  .post(notesController.createNewNote)
  .patch(notesController.updateNote)
  .delete(notesController.deleteNote);

export default router;
