
const express = require("express");
const router = express.Router();

const upload = require("../middlewar/upload");
const product = require("../schema/products");
const user = require("../schema/user")
const swap = require("../schema/swap")
const cloudinary = require("../cloudinary/clodinary");
const middleware = require("../middlewar/middleware");

//uploading a  product
router.post("/upload", middleware, upload.array("images", 5),  async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                message: "Upload at least one image"
            });
        }

        const { title, price, description, size, brand } = req.body;

        if (!title || !price || !brand) {
            return res.status(400).json({
                message: "Missing details"
            });
        }

        const newProduct = new product({
            title: title,
            price: Number(price),
            size:size,
            brand:brand,
            description: description || "",
            images: req.files.map((file) => ({ imageUrl: file.path, publicId: file.filename })),
            owner: req.user.id
        });

        const savedProduct = await newProduct.save();

        return res.status(201).json({
            message: "Product uploaded successfully",
            product: savedProduct
        });

    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            message: "Server didn't respond"
        });
    }
});
 // getting products
router.get("/", async (req, res) => {
     try{
       const products = await product.find();
       res.status(200).json(products);
     }catch(error){
        console.error(error.message);
        return res.status(500).json({message:"server does not respond"});
     }
});

//delete a product 
router.delete("/:id", middleware, async (req, res) => {
    try{
       const productId = req.params.id;

       const existingProduct = await product.findById(productId);

       if(!existingProduct){
        return res.status(404).json({message:"product not found"});
       }

       if(existingProduct.owner.toString() !== req.user.id){
        return res.status(403).json({message:"u cannot delete this product"});
       }

       for (const image of existingProduct.images) {
     await cloudinary.uploader.destroy(image.publicId);
  }
       
       await product.findByIdAndDelete(productId);

       res.status(200).json({message:"product deleted successfully"});
    }catch(error){
        console.error(error.message);
        return res.status(500).json({message:"servcer does not respond"});
    }
});

router.get("/products/:id", async (req, res) => {
    try{
         
      const productid = req.params.id;

     const existingproduct = await product.findById(productid);
     if(!existingproduct){
        return res.status(404).json({message:"product not found"});
     }
     res.status(200).json({existingproduct});

    }catch(error){
        console.error(error.message);
        return res.status(500).json({message:"server did not respond"});
    }
})


// profile 
router.get("/profile", middleware, async (req, res) => {
    try{
        const existingUser = await user.findById(req.user.id)
        .select("-password");

        if(!existingUser){
            return res.status(404).json({message:"user not found"});
        }
     
        res.status(200).json({message:"user fetched", user:existingUser});
    }catch(error){
        console.error(error.message);
        return res.status(500).json({message:"server issue"});
    }
})  ;

//update profile 
router.put("/profile", middleware, upload.single("image"),  async (req, res) => {
    try{
   const { name, location, profileImage, bio } = req.body;
   const data = {
    name,
    location,
    bio
   };
   if(req.file){
    data.profileImage = req.file.path;
   }
   const updated = await user.findByIdAndUpdate(req.user.id,
     data
   , {new:true}, {runValidators:true}).select("-password");

   if(!updated){
    return res.status(404).json({message:"user not found"});
   }

   res.status(200).json({message:"updated", user:updated});
    }catch(error){
        console.error(error.message);
        return res.status(500).json({message:"server issuess"});
    }
});


  
module.exports = router;
