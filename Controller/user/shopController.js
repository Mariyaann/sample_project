const productCollection = require('../../Schema/productModel')
const categoryCollection= require('../../Schema/categoryModel')

const showShopPage = async (req, res) => {
    try
    {
        const categoryData= await productCollection.aggregate([
            {
              $group: {
                _id: "$category_id",
                category_name: { $first: "$category_name" }, 
                count: { $sum: 1 }  
              }
            },
            {
              $project: {
                _id: 0,
                category_id: "$_id",
                category_name: 1,
                count: 1
              }
            }
          ])
          
          const productData= await productCollection.find({product_status:1}).sort({timestamp:-1})
          res.render('./user/shop',{categoryData,productData})
    } 
    catch(err)
    {
        console.log(err)
    }
    
}



module.exports ={
    showShopPage
}