const validation = require("../../public/admin/validations");
const categoryCollection = require("../../Schema/categoryModel");
const dbConnection = require("../../Config/dbConnect");
const { ObjectId } = require("mongodb");
let globalNotification={}

// ----------------------------------- load all category ------------ 
const listCategory = async (req, res) => {
  let notification={}
  const category = req.query.category || ""
  const order = req.query.order || ""
  const search = req.query.search || "";
  let query={ };
  if(globalNotification.status)
    {
      notification=globalNotification;
      globalNotification={}
    }
  if(category && order)
    {
      
      if(order==='asc')
        query[category] = 1
      else
      query[category] = -1
      
    }
    else
    {
      
      query['timestamp']= -1
    }
  try {
    console.log(query)
    const categoryData = await categoryCollection.find({
      category_status: { $ne: -1 },
      category_name: { $regex: search, $options: "i" },
    }).sort(query);
    const categoryCount = await getCategoryCount();
    res.render("./admin/categoryList", { categoryData, dateFormat, notification ,categoryCount});
  } catch (err) {
    console.log("Error occured :" + err);
  }
};

// --------------------------- add new category 

const addCategory = async (req, res) => {
  let category_name = req.body.category_name;
  if (category_name != '') {
    category_name = category_name.trim();
    category_name = category_name.toLowerCase();

    const category = {
      category_name: category_name,
      category_status: 1,
      timestamp: Date.now(),
    };
    try {
      const exists = await categoryCollection.findOne({
        category_name: category_name , category_status : 1 
      });
      if (exists === null) {
        await categoryCollection
          .insertMany(category)
          .then(() => {
            globalNotification['status'] = 'success';
            globalNotification['message'] = "Category added Successfully";
          })
          .catch((err) => {
            globalNotification['status'] = 'error';
            globalNotification['message'] = "Something went Wrong";
            console.log("error occured" + err);
          });
      } else {
        // flas messgae go here
        globalNotification['status'] = 'error';
        globalNotification['message'] = "Category already Exists";
      }
    } catch (err) {
      globalNotification['status'] = 'error';
      globalNotification['message'] = "Something went Wrong";
      console.log("error occured" + err);
    }
  }
  res.redirect(`/admin/category`)
};

// ------------------ Delete category -------------------------- 

const removeCategory = async (req, res) => {
  const id = req.params.id
  try {
    const updateCategory = await categoryCollection.findByIdAndUpdate({ _id: new ObjectId(id) }, { $set: { category_status: -1 } })
    globalNotification['status']='success';
    globalNotification['message']='category deleted successfuly'
  }
  catch (err) {
    // flas messgae go here
    globalNotification['status']='error';
    globalNotification['message']='Something went wrong'
    console.log("unable to delete the category" + err)

  }

  res.redirect(`/admin/category`)
}

// --------------------------- Edit category ------------------------- 

const editCategory = async (req, res) => {
  const id = req.params.id;
  if (id) {
    try {
      const categoryData = await categoryCollection.findOne({ _id: new ObjectId(id), category_status: { $ne: -1 } }, {})
      res.render('./admin/editCategory', { categoryData })
    }
    catch (err) {
      // flas messgae go here
      globalNotification['status']='error';
      globalNotification['message']='Something went wrong'
      console.log("Not able to fetch data " + err);
      res.redirect(`/admin/category`)
    }
  }
  else {
    
    globalNotification['status']='error';
    globalNotification['message']='Something went wrong'
    res.redirect(`/admin/category`)
  }
}


// ---------------------------- Update category ------------ 

const updateCategory = async (req, res) => {
  const id = req.params.id;
  let new_name = req.body.category_name;
  new_name = new_name.trim()
  new_name = new_name.toLowerCase()
  try {
    const exists = await categoryCollection.findOne({ category_name: new_name , category_status : 1 })
    if (exists == null) {
      await categoryCollection.findByIdAndUpdate({ _id: new ObjectId(id) }, { $set: { category_name: new_name } }).then(() => {
        // flas messgae go here
        globalNotification['status']='success';
        globalNotification['message']='category Updated successfuly'
      }).catch((err) => {
        // flas messgae go here
        globalNotification['status']='error';
        globalNotification['message']='Something went wrong'

        console.log("can't update category" + err);
      })
    }
    else{
      globalNotification['status']='error';
      globalNotification['message']='Category already exixts'

    }
  }
  catch (err) {
    // flas messgae go here
    globalNotification['status']='error';
    globalNotification['message']='Something went wrong'

    console.log("can't update category" + err);
  }


  res.redirect(`/admin/category`)

}

function dateFormat(inputDate) {
  const formated = new Date(inputDate);

  const options = { year: "numeric", month: "short", day: "numeric" };
  const formattedDate = formated.toLocaleDateString("en-US", options);
  return formattedDate;
}
async function getCategoryCount()
{
    return await categoryCollection.find({category_status:{$ne:-1}}).count()
}

module.exports = { listCategory, addCategory, removeCategory, editCategory, updateCategory };
