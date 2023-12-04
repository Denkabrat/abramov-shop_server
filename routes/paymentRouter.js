const Router = require('express');
const router = new Router();
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');
const AuthMiddleware = require('../middleware/authMiddleWare');
const paymentController = require('../controllers/paymentController');


router.get('/payment-success',AuthMiddleware, paymentController.paymentSuccess);
router.get('/payment-get-order',AuthMiddleware, paymentController.getPaymentOrder);
router.post('/payment-order',AuthMiddleware,paymentController.makeOrderWithPayment);
router.get('/getAllOrders',checkRoleMiddleware('aedizkddlnrjmixsbo'),paymentController.getAllOrders);
router.put('/update-order-status',checkRoleMiddleware('aedizkddlnrjmixsbo'),paymentController.updateOrderStatus);





module.exports = router;
