const wishlistCollection = require('../../Schema/wishlistModel')


const addWishlist = async (req, res) => {
    const response = {};
    const data = {
      customer_id: req.session.user,
      product_id: req.body.productId,
    };
  
    try {
      const checkWishList = await wishlistCollection.findOne(data);
  
      if (checkWishList == null) {
        await wishlistCollection.insertMany(data);
        response.success = true;  
        response.action='added'
      } else {
        await wishlistCollection.findOneAndDelete({ _id: checkWishList._id });
        response.success = true;  
        response.action='deleted'

      }
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.status(400).json({ success: false, message: err.message });  // Return error message
    }
  };
  

module.exports ={
    addWishlist
}