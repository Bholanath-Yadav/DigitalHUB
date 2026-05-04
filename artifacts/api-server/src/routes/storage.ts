import { Router, type IRouter } from "express";
import multer from "multer";
import { uploadFile } from "../lib/supabase";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post("/storage/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file provided" });

    const { folder = "uploads" } = req.body;
    const safeFolders = ["payment-screenshots", "product-images", "banner-images", "qr-codes"];
    if (!safeFolders.includes(folder)) {
      return res.status(400).json({ error: "Invalid folder" });
    }

    const ext = req.file.originalname.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const publicUrl = await uploadFile(path, req.file.buffer, req.file.mimetype);
    return res.json({ url: publicUrl, path });
  } catch (err) {
    req.log.error(err);
    return res.status(500).json({ error: "Upload failed" });
  }
});

export default router;
