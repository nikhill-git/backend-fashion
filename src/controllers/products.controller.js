const addProducts = async(req, res) => {
    try{
        const {totalProducts, products} = req.body

        if(!totalProducts || !products.length){
            return res.status(400).json({
                success : false,
                message :"Required feilds are missing"
            })
        }

        if(totalProducts !== products.length){
            return res.status(400).json({
                success : false,
                message : "Misinformation"
            })
        }

        let totalPrice = 0;
        let tax = 0;
        products.forEach((val) => {
            totalPrice += (val.price * val.quantity)
            tax += (val.quantity * 50)
        })

        

        
    }
    catch(err){
        return res.status(400).json({
            success : false,
            message : err.message || "Oops something went wrong"
        })
    }
}

module.exports = {
    addProducts
}