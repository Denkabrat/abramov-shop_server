const Router = require('express');
const router = new Router();
const BasketController = require('../controllers/basketController');
const AuthMiddleware = require('../middleware/authMiddleWare');



router.post('/addToCart',AuthMiddleware,BasketController.create);
router.get('/getCart',AuthMiddleware,BasketController.getAllGood);
router.put('/changeCountAndDelete',AuthMiddleware,BasketController.changeGoodCountAndDelete);



module.exports = router;


