const coupenCollection = require('../../Schema/coupenModel')

const getCoupen = async (req, res) => {
    await checkCoupenStatus();
    try {
      let { total_amount } = req.body;
      total_amount = Math.round(total_amount);
      const coupenData = await coupenCollection.find({ coupen_amount_limit: { $lte: total_amount } });
      res.json(coupenData);
    } catch (err) {
      console.log(err);
      res.status(400).json();
    }
  };
  


// ---------------------------- other functions ----------------------- 

async function checkCoupenStatus() {
    try {
        const currentDate = new Date();
        const result = await coupenCollection.deleteMany(
            { coupen_expiry: { $lt: currentDate } },
            { $set: { coupen_status: 0, updatedAt: currentDate } }
        );
        console.log(result);
    } catch (err) {
        console.log(err);
    }
}
module.exports ={
    getCoupen
}
