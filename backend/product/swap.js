

const express = require("express");
const router = express.Router();

const upload = require("../middlewar/upload");
const product = require("../schema/products");
const user = require("../schema/user")
const swap = require("../schema/swap")
const cloudinary = require("../cloudinary/clodinary");
const middleware = require("../middlewar/middleware");

//swap
router.post("/request", middleware, async (req, res) => {
    try{
      const { request, offer } = req.body;

      const requestId = req.user.id;
      if(!request || !offer){
        return res.status(400).json({message:'both ids required'});
      };
      if(request === offer){
        return res.status(400).json({message:"u cannot sell urself"});
      }
      const wanted = await product.findById(request);
      const mine = await product.findById(offer);

      if(!wanted || !mine){
        return res.status(404).json({message:"product not found"});
      }
      if(wanted.owner.toString() === requestId){
        return res.status(403).json({message:"you cannot sell a product"});

      } 
      if(mine.owner.toString() !== requestId ){
        return res.status(403).json({messsage:"cannot offer a product"})
      }
      const newSwap = new swap({
        requester:requestId,
        owner:wanted.owner,
        requestedProduct:wanted._id,
        offeredProduct:mine._id
      })

      const savedSwap = await newSwap.save();

      return res.status(201).json({message:"swap request successfully", swap:savedSwap});

    }catch(error){
        console.error(error.message);
        return res.status(500).json({message:"server did not respond"});
    }
});
//incoming swap request 
router.get("/request", middleware, async (req, res) => {
    try{
    const requests = await swap.find({
        owner:req.user.id,
        status:"pending"
    }).populate("requester", "name")
     .populate("requestedProduct", "title images price brand size")
        .populate("offeredProduct", "title images price brand size");
    return res.status(200).json({message:"created successfully", requests:requests});
    }catch(error){
        console.error(error.message);
        return res.status(500).json({message:"server did not respond"});
    }
    
});


// accept or reject request
router.patch("/request/:id", middleware, async (req, res) => {
    try {
        const { status } = req.body;
        const request = req.params.id;
        const userId = req.user.id;

        if (!["accepted", "rejected"].includes(status)) {
            return res.status(400).json({
                message: "invalid status"
            });
        }

        const swapID = await swap.findById(request);

        if (!swapID) {
            return res.status(404).json({
                message: "swap request not found"
            });
        }

        if (swapID.owner.toString() !== userId) {
            return res.status(403).json({
                message: "not authorized"
            });
        }

        if (swapID.status !== "pending") {
            return res.status(400).json({
                message: "request already processed"
            });
        }

        // Find both products
        const wanted = await product.findById(swapID.requestedProduct);
        const mine = await product.findById(swapID.offeredProduct);

        if (!wanted || !mine) {
            return res.status(404).json({
                message: "one or both products not found"
            });
        }

        // If accepted, make both products unavailable
        if (status === "accepted") {

            if (wanted.available === false || mine.available === false) {
                return res.status(400).json({
                    message: "one or both products are already unavailable"
                });
            }

            wanted.available = false;
            mine.available = false;

            await wanted.save();
            await mine.save();
        }

        // Update swap request status
        swapID.status = status;
        await swapID.save();

        return res.status(200).json({
            message: `swap request ${status}`,
            swap: swapID
        });

    } catch (error) {
        console.error(error.message);

        return res.status(500).json({
            message: "server did not respond"
        });
    }
});
//outgoing requests 
router.get("/outgoing", middleware, async (req, res) => {
    try{
     const outgoingRequests = await swap.find({
        requester :req.user.id
     }).populate("owner", "name")
     .populate("requestedProduct", "title images")
     .populate("offeredProduct", "title images");

     return res.status(200).json({requests:outgoingRequests})
    }catch(error){
        console.error(error.message);
        return res.status(500).json({message:"server did not respond"});
    }
});
//swap history
router.get("/history", middleware, async (req, res) =>{
    try{
       const history = await swap.find({
       $or : [
        { requester : req.user.id },
         { owner : req.user.id } 
       ] , 
       status : "completed"
       }) .populate("requester", "name")
        .populate("owner", "name")
        .populate("requestedProduct", "title images")
        .populate("offeredProduct", "title images");

        return res.status(200).json({message:"swap history fetched", history: history});
    }catch(error){
        console.error(error.message);
        return res.status(500).json({message:'server did not respond '})
    }
});
//confirmed

router.patch("/confirmed/:id", middleware, async (req, res) => {
    try {
        const swapRequest = await swap.findById(req.params.id);

        if (!swapRequest) {
            return res.status(404).json({
                message: "swap not found"
            });
        }

        if (swapRequest.status !== "accepted") {
            return res.status(400).json({
                message: "only accepted swaps can be confirmed"
            });
        }

        const userId = req.user.id;

        if (swapRequest.requester.toString() === userId) {

            if (swapRequest.requesterConfirmed) {
                return res.status(400).json({
                    message: "You have already confirmed this swap"
                });
            }

            swapRequest.requesterConfirmed = true;

        } else if (swapRequest.owner.toString() === userId) {

            if (swapRequest.ownerConfirmed) {
                return res.status(400).json({
                    message: "You have already confirmed this swap"
                });
            }

            swapRequest.ownerConfirmed = true;

        } else {
            return res.status(403).json({
                message: "You are not part of this swap"
            });
        }

        if (
            swapRequest.requesterConfirmed &&
            swapRequest.ownerConfirmed
        ) {
            swapRequest.status = "completed";
        }

        await swapRequest.save();

        return res.status(200).json({
            message: "Swap confirmation updated",
            swap: swapRequest
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "server issues"
        });
    }
});

module.exports = router;



