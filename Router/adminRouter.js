const { Router } = require("express");
const router = Router()
const adminController = require('../Controller/admin/adminController')
const categoryController = require('../Controller/admin/categoryController')
const productController = require('../Controller/admin/productCntroller')
const upload = require('../Middleware/multer');
const { adminSessionCheck, adminLoginCheck } = require('../Middleware/adminMiddleware')

// ---- login and dashbored --- 
router.get('/', adminLoginCheck, adminController.loadAdminLogin)
router.post('/login', adminLoginCheck, adminController.adminLogin)
router.get('/dashboard', adminSessionCheck, adminController.loadDashBoard)


// ----- user managment ----------
router.get('/clients', adminSessionCheck, adminController.clientsListLoad)
router.get('/updateStatus/:id/:status', adminSessionCheck, adminController.updateClientStatus)

// --------- category managment ------- 
router.get('/category', adminSessionCheck, categoryController.listCategory)
router.post('/addCategory', adminSessionCheck, categoryController.addCategory)
router.get('/removeCategory/:id', adminSessionCheck, categoryController.removeCategory)
router.get('/editCategory/:id', adminSessionCheck, categoryController.editCategory)
router.post('/editCategory/:id', adminSessionCheck, categoryController.updateCategory)

// ----------- Product managment ----------- 
router.get('/products', adminSessionCheck, productController.listProducts)
router.post('/add-product', adminSessionCheck, upload.array('product_images', 10), productController.addProduct)
router.get('/updateProductStatus/:id/:status', adminSessionCheck, productController.updateStatus)
router.get('/editproduct/:id', adminSessionCheck, productController.editProduct)
router.get('/product-image-delete/:id/:index', adminSessionCheck, productController.deleteProductImage);
router.post('/update-product/:id', adminSessionCheck, upload.array('product_images', 10), productController.updateProduct)


module.exports = router