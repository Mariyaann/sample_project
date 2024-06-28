const orderCollection = require('../../Schema/orderModel')
const productCollection = require('../../Schema/productModel')
const walletCollection = require('../../Schema/walletModel')
let globalNotification ={}


// ----------------------- view full order list ---------------------  
const viewOrders= async (req,res)=>{
    let notification={}
    const user_id = req.session.user
    if(globalNotification.status)
        {
         notification= globalNotification;
         globalNotification={}
        }
    try{
        // const updateOrder = await updateOrderStatus(user_id)
        
        const orderData = await orderCollection.find({customer_id:user_id}).sort({createdAt:-1})
        
        res.render('./user/order',{orderData,notification})
        
    }
    catch(err)
    {
        console.log(err); 
    }

}

// ------------------------- individual order view ------------- 
const viewOrderDetails = async (req,res)=>{
    let notification={}
     const customer_id = req.session.user;
    const order_id = req.params.id;
    try
    {
        const productData = await orderCollection.findOne({ _id : order_id,customer_id:customer_id })
        res.render('./user/singleOrderDetails',{ productData, notification })
    }
    catch(error)
    {
        globalNotification={
            status: "error",
            message: "Something went Wrong"
        }
        res.redirect('/orders')
    }
}

// -------------------- Cancel Entire Order ----------------- 

const cancelOrder = async (req, res) => {
    const orderId = req.params.id;
    const customer_id = req.session.user;

    try {
        const orderData = await orderCollection.findOne({ _id: orderId, customer_id: customer_id });
        if (orderData) {
            for (const product of orderData.products) {
                try {
                    await productCollection.findOneAndUpdate(
                        { _id: product.product_id },
                        { $inc: { product_stock: product.product_quantity } }
                    );
                    await orderCollection.findOneAndUpdate(
                        { _id: orderId, 'products.product_id': product.product_id },
                        { $set: { 'products.$.product_status': 'Cancelled' } }
                    );
                } catch (err) {
                    console.log(err);
                    globalNotification = {
                        status: 'error',
                        message: 'Something went wrong'
                    };
                    res.redirect('/orders');
                    return;
                }
            }

            await orderCollection.findOneAndUpdate({ _id: orderId }, { $set: { orderStatus: 'Cancelled' } });

            if (['razorpay', 'Wallet'].includes(orderData.paymentMethod)) {
                const wallet_balance = orderData.totalPrice;
                const transaction_details = {
                    wallet_amount: (orderData.totalPrice).toFixed(2),
                    order_id: orderData.order_id,
                    transactionType: 'Credited'
                };

                const checkWallet = await walletCollection.findOne({ customer_id: customer_id });
                if (checkWallet) {
                    await walletCollection.findOneAndUpdate(
                        { _id: checkWallet._id },
                        { 
                            $inc: { wallet_balance: wallet_balance },
                            $push: { transaction: transaction_details }
                        }
                    );
                } else {
                    await walletCollection.create({
                        customer_id: customer_id,
                        wallet_balance: wallet_balance,
                        transaction: [transaction_details]
                    });
                }
            }

            globalNotification = {
                status: 'success',
                message: 'Order Canceled Successfully'
            };
            res.redirect('/orders');
        }
    } catch (err) {
        console.log(err);
        globalNotification = {
            status: 'error',
            message: 'Something went wrong'
        };
        res.redirect('/orders');
    }
};

// -------------------------------------- Other functions ------------------------- 

// ------------------- Recheck order STatus --------------- 

async function updateOrderStatus(customer_id)
{    
    const getOrderDetails = await orderCollection.find({ customer_id: customer_id })
    getOrderDetails.forEach(async (order)=>{
       const products = order.products;
       let status= true;
       const statusSet = new Set();
       for(let product of products)
        {
            if(statusSet.has(product))
                {
                    status = false;
                    break;
                }
                else
                {
                    statusSet.add(product)
                }
        }
        if(status && order.orderStatus!== order.products[0].product_status)
            {
                await orderCollection.findOneAndUpdate({ customer_id: customer_id,_id:order._id},{$set:{orderStatus:order.products[0].product_status}})
            }
    })

    
    
}
module.exports ={
viewOrders,
viewOrderDetails,
cancelOrder
}