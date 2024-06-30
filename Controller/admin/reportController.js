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
    res.render('./admin/report')
}


module.exports ={
    getPieChart,
    getSalesByMonth,
    reportPage
}