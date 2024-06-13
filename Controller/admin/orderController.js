
const orderCollecion = require('../../Schema/orderModel')
let globalNotification ={}
const { ObjectId } = require('mongodb');


const showOrders = async (req,res)=>{
    let notification ={}
    if(globalNotification.status)
        {
            notification = globalNotification;
            globalNotification={}
        }
    try
    {
        const orderDetails = await orderCollecion.find().sort({orderStatus:-1, createdAt:-1})
        const pendingCount = await orderCollecion.find({orderStatus:'Pending'}).count()
        res.render('./admin/orderList',{orderDetails,notification,pendingCount,dateFormat})
    }
    catch(err)
    {
        console.log(err);
        res.redirect('/admin')
    }
}

const updateOrderStatus= async (req,res)=>{
    const order_id = req.params.id
    const status = req.params.status
    if(status)
        {
            try
            {
                
                const updateStatus = await orderCollecion.findOneAndUpdate({ _id : new ObjectId (order_id) },{ $set:{orderStatus:status} }) 
                if(updateStatus)
                    {
                        
                        globalNotification={
                            status:'success',
                            message:"Order Status Updated"
                        }
                    }
            }
            catch(err)
            {
                globalNotification={
                    status:'error',
                    message:"Something went wrong. Try again"
                }
            }
            res.redirect('/admin/order')
        }
}
// ------------------ Other Functions ----------------------------------------------------- 
function dateFormat(inputDate) {
    const formated = new Date(inputDate);
  
    const options = { year: "numeric", month: "short", day: "numeric" };
    const formattedDate = formated.toLocaleDateString("en-US", options);
    return formattedDate;
  }

module.exports ={
    showOrders,
    updateOrderStatus
}

