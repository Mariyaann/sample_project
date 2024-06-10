const { ObjectId } = require('mongodb')
const cartCollection = require('../../Schema/cartModel')
const productCollection = require('../../Schema/productModel')
let globalNotification ={}
const addToCart = async (req, res) => {
    const data = {
        customer_id: req.session.user,
        product_id: req.params.id,
        quantity: req.body.quantity
    };

    try {
        const stock = await productCollection.findOne({ _id: new ObjectId(data.product_id),product_status:1 }, { product_stock: 1 });

        if (stock.product_stock < data.quantity || data.quantity <= 0) {
            globalNotification = {
                status: 'error',
                message: data.quantity <= 0 ? "Please add a valid quantity" : `Maximum quantity that can be added is ${stock.product_stock}`
            };
            return res.redirect(`/view-product/${data.product_id}`);
        }

        const checkProduct = await productExist(data.product_id, data.customer_id);

        if (checkProduct) {
            const newQuantity = data.quantity + checkProduct.quantity;
            
                await cartCollection.findOneAndUpdate(
                    { _id: new ObjectId(checkProduct._id), product_id: new ObjectId(data.product_id) },
                    { $set: { quantity: data.quantity } },
                    { returnOriginal: false }
                );
            
        } else {
            data['cart_status'] = 1;
            await cartCollection.insertOne(data);
        }

        globalNotification = {
            status: 'success',
            message: "Product Added to Cart"
        };
        res.redirect(`/view-product/${data.product_id}`);
    } catch (err) {
        console.log(err);
        res.redirect(`/view-product/${data.product_id}`);
    }
};

// ------------------------- View Single Product -----------------------

const viewProduct = async (req, res) => {
    const id = req.params.id || "";
    const userId = req.session.user
    let notification ={}
    if(globalNotification.status)
        {
            notification= globalNotification;
            globalNotification={}
        }
    if (id !== "") {
      try {
        // ------------------- Checking the user is active and product already exitst ------------------
        const cartData = await productExist(id,userId)

        const productData = await productCollection.findOne({
          _id: new ObjectId(id),
        });
        const allProducts = await productCollection.find({category_id:productData.category_id, product_status:1 , _id:{$ne:new ObjectId(productData._id)}})
        res.render("./user/singleProduct", { productData,allProducts,notification , cartData});
      } catch (err) {
        console.log(err);
        res.redirect("/");
      }
    } else {
      res.redirect("/");
    }
  };

  const viewCart= async (req,res)=>{
      const userId= req.session.user;
      try{  
            const cartItems = await cartCollection.find({customer_id: new ObjectId(userId),cart_status:1})
      }
      catch(err){
        console.log(err)
      }


  }

async function ckeckProductAvailability(productId,userId,userStock){

}

  async function productExist(productId,userId){
    let responce;
    
    if(!productId || !userId){
        responce = false;
    }
    else
    {
       
        try
        {
            const checkProduct = await cartCollection.findOne({customer_id : new ObjectId(userId),product_id: new ObjectId(productId)})
        
        if(checkProduct!==null)
            {
                responce = checkProduct;
            }
            else
            {
                responce = false;
            }
        }
        catch(err)
        {
            console.log(err)
        }
    }

    return responce;
  }





module.exports = {
    addToCart,
    viewProduct,
    viewCart
}




















 



