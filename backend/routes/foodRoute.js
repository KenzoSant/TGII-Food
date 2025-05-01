import express from "express";
import { addFood, listFood, removeFood, editFood } from "../controllers/foodController.js";
import multer from "multer";
import authMiddleware from "../middleware/auth.js";

const foodRouter = express.Router();

const storage = multer.diskStorage({
    destination: "uploads",
    filename: (req, file, cb) => {
        return cb(null, `${Date.now()}${file.originalname}`)
    }
})

const upload = multer({ storage: storage })

foodRouter.post("/add", upload.single("image"), authMiddleware, addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", authMiddleware, removeFood);
foodRouter.post("/edit", upload.single("image"), authMiddleware, editFood);

export default foodRouter;