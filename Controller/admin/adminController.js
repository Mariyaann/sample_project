const validation = require("../../public/admin/validations");
const clientCollection = require("../../Schema/clientModel");
const dbConnection = require("../../Config/dbConnect");
const { ObjectId } = require("mongodb");
const productModel = require("../../Schema/productModel");

const loadAdminLogin = (req, res) => {
  res.render("./admin/login", { error: null, message: "", formValues: {} });
};
const adminLogin = (req, res) => {
  const adminEmail = "admin@gmail.com";
  const adminPassword = "admin@123";
  const data = {
    email: req.body.adminEmail,
    password: req.body.adminPassword,
  };
  const valid = validation.loginValidation(data);
  if (valid.error) {
    res.render("./admin/login", {
      error: true,
      message: valid.message,
      formValues: data,
    });
  } else {
    if (!(data.email === adminEmail) || !(data.password === adminPassword)) {
      res.render("./admin/login", {
        error: true,
        message: "Incorrect Email or password",
        formValues: data,
      });
    } else {
      req.session.adminEmail = data.email;
      res.redirect("/admin/dashboard");
    }
  }
};

const clientsListLoad = async (req, res) => {
  const search = req.query.search || "";
  const sort = req.query.sort || "";
  const category = req.query.category || "";
  let query = { customer_status: { $ne: -1 } };
  const page = req.query.page || 1;
  const dataCount = page * 10;
  const skipCount = page > 1 ? (page - 1) * 10 : 0;
  let responce = {};
  if (search !== "") {
    query = {
      ...query,
      $or: [
        { customer_name: { $regex: search, $options: "i" } },
        { customer_emailid: { $regex: search, $options: "i" } },
      ],
    };
  }

  try {
    let clientData;
    if (sort !== "" && category !== "") {
      const sortOption = {};
      sortOption[category] = sort === "asc" ? 1 : -1;
      clientData = await clientCollection
        .find(query)
        .sort(sortOption)
        .skip(skipCount)
        .limit(dataCount);
    } else {
      clientData = await clientCollection
        .find(query)
        .skip(skipCount)
        .limit(dataCount);
    }
    const userCount= await getUserCount()
    res.render("./admin/userList", { clientData, dateFormat, page, responce ,userCount});
  } catch (err) {
    console.log(err);
  }
};
const updateClientStatus = async (req, res) => {
  const status = Number(req.params.status);
  const id = req.params.id; // Use response for consistency
  let search = "";

  if (status >= -1 && status <= 1) {
    try {
      const updateResult = await clientCollection.findByIdAndUpdate(id, {
        customer_status: status,
      });

      if (updateResult != null) req.flash("message", "Client status updated");
    } catch (err) {
      console.log("cant update the user" + err);
    }
  } else {
    console.log("cant update the user");
  }
  res.redirect(`/admin/clients`);
};

const loadDashBoard = async (req, res) => {
  const userCount = await getUserCount()
  res.render("./admin/dashboard",{userCount});
};

const logout = (req,res)=>{
  req.session.destroy();
  res.redirect('/admin')
}

function dateFormat(inputDate) {
  const formated = new Date(inputDate);

  const options = { year: "numeric", month: "short", day: "numeric" };
  const formattedDate = formated.toLocaleDateString("en-US", options);
  return formattedDate;
}

async function getUserCount(){
  return await clientCollection.find({customer_status:{$ne:-1}}).count()
}

module.exports = {
  loadAdminLogin,
  adminLogin,
  loadDashBoard,
  clientsListLoad,
  updateClientStatus,
  logout
};
