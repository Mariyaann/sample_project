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
  
// --------------------- Get single coupen details --------------- 

const getSingleCoupen = async (req,res)=>{
  const coupen_code = req.body.coupen_code || "";
  if(coupen_code)
    {
      try{
          await checkCoupenStatus();
          const coupenData = await coupenCollection.findOne({coupen_code:coupen_code})
          if(coupenData)
            {
              res.json(coupenData)
            }
            else
            {
              res.status(400).json("No coupen Found with coupen code ")
            }
      }
      catch(err)
      {
        res.status(400).json(err)
      }
    }
    else
    {
      res.status(400).json()
    }

}

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
    getCoupen,
    getSingleCoupen
}
