const router = require("express").Router();
const { verifyAdmin } = require("../middleware/verifyToken");
const Instagram = require("../model/Instagram");

// NEW INSTAGRAM POST
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const newPost = new Instagram({
      image: req.body.image,
      username: req.body.username,
    });

    const savedpost = await newPost.save();

    res.status(200).json({
      message: "Post Added Successfully",
      savedpost,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const allPost = await Instagram.find().sort({ createdAt: -1 });
    res.status(200).json({
      message: "All Posts",
      allPost,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    await Instagram.findByIdAndDelete(req.params.id);
    res.status(200).json({
      message: "Post Has Been Deleted Sucessfully!!!",
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
