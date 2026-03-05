const productModel = require("../models/products.model")

const getProducts = async(req, res) => {
    try {
        const productsForFeed = await productModel.find({})
        if(!productsForFeed.length){
            return res.status(404).json({
                status : true,
                message : "No products found",
                products : productsForFeed
            })
        }

        return res.status(200).json({
            status : true,
            products : productsForFeed
        })
    }
    catch(err){
        return res.status(400).json({success : false, message : err.message || "Oops something went wrong"})
    }
}

const productInfo = async(req, res) => {
    try {
        const {productId} = req.params

        if(!productId){
            return res.status(400).json({success : false,
                message : "Requried productId not found"
            })
        }

        const productInfo = await productModel.findById(productId)

        if(!productInfo){
            return res.status(404).json({success : true, message : "Product not found"})
        }

        return res.status(200).json({
            success : true,
            productInfo : productInfo
        })
    }
    catch(err){
        return res.status(400).json({success : false, message : err.message || "Oops something went wrong"})
    }
}

const getCategoryWiseProducts = async(req, res) => {
    try{
        const {category} = req.params

        if(!category){
            return res.status(400).json({success : false, message : "Invalid category"})
        }

        const categoryWiseProducts = await productModel.find({category : category})

        if(!categoryWiseProducts.length){
            return res.status(404).json({success : false, message : "No products found"})
        }

        return res.status(200).json({
            success : true, 
            products : categoryWiseProducts 
        })
    }
    catch(err){
        return res.status(400).json({success : false, message : err.message || "Oops something went wrong"})
    }
}

const getProductsBybrand = async(req, res) => {
    try {
        const {brand} = req.params
        if(!brand){
        return res.status(400).json({success : false, message : "Invalid brand name"})
        }

        const brandWiseProducts = await productModel.find({brand : brand})

        if(!brandWiseProducts.length){
            return res.status(404).json({success : false, message : "No products found"})
        }

        return res.status(200).json({success: true, products : brandWiseProducts})
    }
    catch(err){  
        return res.status(400).json({success : false, message : err.message || "Oops something went wrong"})        
    }
}


module.exports = {
    getProducts,
    productInfo,
    getCategoryWiseProducts,
    getProductsBybrand
}