import { Router } from "express";
import {
  getBookmarks, addBookmark, removeBookmark,
  checkBookmark, updateBookmarkNote,
} from "../controllers/bookmarkController";
import { protect } from "../middleware/auth";
import { validate, bookmarkSchema } from "../middleware/validation";

const router = Router();

// All bookmarks routes require auth
router.use(protect);

router.get("/",                                getBookmarks);
router.post("/:eventId",   validate(bookmarkSchema), addBookmark);
router.delete("/:eventId",                     removeBookmark);
router.get("/:eventId/check",                  checkBookmark);
router.put("/:eventId/note",                   updateBookmarkNote);

export default router;
