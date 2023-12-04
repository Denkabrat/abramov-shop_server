const Router = require('express');
const goodRouter = require('./goodRouter');
const typeRouter = require('./typeRouter');
const userRouter = require('./userRouter');
const basketRouter = require('./basketRouter');
const userInformationRouter = require('./userInformationRouter');
const userAddressRouter = require('../routes/userAddressRouter');
const paymentRouter = require('./paymentRouter');
const router = new Router();


router.use('/user',userRouter);
router.use('/type',typeRouter);
router.use('/good',goodRouter);
router.use('/basket',basketRouter);
router.use('/information',userInformationRouter);
router.use('/address',userAddressRouter);
router.use('/payment',paymentRouter);



module.exports = router;