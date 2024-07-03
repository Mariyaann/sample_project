const orderCollection = require('../../Schema/orderModel')
const getPieChart = async (req, res) => {
    try {
        const orders = await orderCollection.aggregate([
            { $match: { orderStatus: { $in: ['Confirmed', 'Delivered', 'Shipped','Pending'] } } },
            { $unwind: "$products" },
            {
                $group: {
                    _id: "$products.product_category",
                    totalRevenue: { $sum: { $multiply: ["$products.product_quantity", "$products.product_price"] } }
                }
            }
        ]);
        res.json(orders);
    } catch (err) {
        console.log(err);
        res.json(err);
    }
};

const getSalesByMonth = async (req, res) => {
    try {
        const sales = await orderCollection.aggregate([
            { $match: { orderStatus: { $in: ['Confirmed', 'Delivered', 'Shipped', 'Pending'] } } },
            {
                $group: {
                    _id: { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } },
                    totalSales: { $sum: "$totalPrice" },
                    count: { $sum: 1 }  // Count the number of orders
                }
            },
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            }
        ]);
        res.json(sales);
    } catch (err) {
        console.log(err);
        res.json(err);
    }
};

const reportPage =async (req,res)=>{
    const totalAmount = await orderCollection.aggregate([
        { $match: { orderStatus: { $in: ['Confirmed', 'Delivered', 'Shipped'] } } },
        { $group: { _id: null, totalPrice: { $sum: "$totalPrice" } } }
    ])
    const totalSales = await orderCollection.find({orderStatus:{$in:['Confirmed', 'Delivered', 'Shipped','Pending']}}).count()
    const totalPrice = totalAmount.length > 0 ? (totalAmount[0].totalPrice).toFixed(2) : 0;

    
    res.render('./admin/report',{totalSales, totalPrice  , dateFormat})
}

const getOrderDetails = async (req, res) => {
    let { startDate, endDate, salesreportType } = req.body;
    let orderDetails;
    
    try {
        if (!salesreportType) {
            orderDetails = await orderCollection.aggregate([
                {
                    $lookup: {
                        from: 'coupons',
                        localField: 'coupen_id',
                        foreignField: '_id',
                        as: 'coupen_data'
                    }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ])
        } else {
            
            orderDetails = await orderCollection.aggregate([
                { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
                {
                    $lookup: {
                        from: 'coupons',
                        localField: 'coupen_id',
                        foreignField: '_id',
                        as: 'coupen_data'
                    }
                },
                {
                    $sort: { createdAt: -1 }
                }
            ])
        }
        
        console.log("orderDetails",orderDetails);
        res.json(orderDetails);
    } catch (err) {
        console.log(err);
        res.status(400).json(err);
    }
};


function dateFormat(inputDate) {
    
    const formated = new Date(inputDate);
    const options = { year: "numeric", month: "short", day: "numeric" };
    const formattedDate = formated.toLocaleDateString("en-US", options);
    return formattedDate;
  }


module.exports ={
    getPieChart,
    getSalesByMonth,
    reportPage,
    getOrderDetails
}