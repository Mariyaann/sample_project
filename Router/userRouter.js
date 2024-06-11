const { Router } = require("express");
const router =Router()
const passport = require('passport');
const userContoller=require('../Controller/user/userController')
const shopController = require('../Controller/user/shopController')
const profileController = require('../Controller/user/profileController')
const cartController = require('../Controller/user/cartController')
require('../Service/googleAuth')
const {userSessionCheck}= require('../Middleware/userMiddleware');
const cartCollection = require("../Schema/cartModel");
router.get('/',userContoller.indexPage)

router.get('/signup',userContoller.showSignUp)
router.post('/signup',userContoller.addUser)
router.get('/resendOTP',userContoller.resendOTP)
router.post('/otp-verification',userContoller.verifyOTP)
router.get('/otp-expired',userContoller.otpExpired)
router.get('/login',userContoller.loginLoad)
router.post('/login',userContoller.userLogin)
router.get('/logout',userContoller.logout)
router.get('/view-product/:id',cartController.viewProduct)
router.get('/reset-password',userContoller.resetPassword)
router.post('/verifyEmail',userContoller.verifyEmail)
router.post('/otp-verification-password',userContoller.passwordOtpVerify)
router.post('/otp-verification-password',userContoller.passwordOtpVerify)
router.post('/updatePassword',userContoller.updatePassword)
router.get('/auth/google',passport.authenticate('google', { scope: ['profile', 'email'] }))
router.get('/auth/google/callback',
passport.authenticate('google', { failureRedirect: '/signup' }),userContoller.googleLogin);

// ------------ Shop ----------------- 
router.get('/shop',shopController.showShopPage)


// -------------- Profile page ----------------- 
router.get('/profile',userSessionCheck, profileController.showProfile)
router.post('/update-profile',userSessionCheck,profileController.updateProfile)
router.post('/add-address',userSessionCheck,profileController.addAddress)
router.get('/edit-address/:index',userSessionCheck,profileController.editAddress)
router.post('/update-address/:index',userSessionCheck,profileController.updateAddress)
router.get('/remove-address/:index',userSessionCheck,profileController.removeAddress)


// ---------------- Cart Section -------------------- 

router.post('/add-to-cart/:id',userSessionCheck,cartController.addToCart)
router.get('/view-cart',userSessionCheck,cartController.viewCart)
router.get('/remove-cart-item/:id',userSessionCheck,cartController.removeCartItem)
router.get('/checkout',userSessionCheck,cartController.checkoutPage)
router.post('/checkout',userSessionCheck,cartController.checkOut)

module.exports = router     