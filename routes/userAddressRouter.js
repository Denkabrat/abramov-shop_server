const Router = require('express');
const router = new Router();
const addressController = require('../controllers/personalAddressController');
const authMiddleWare = require('../middleware/authMiddleWare');


router.put('/changeAddress',authMiddleWare,addressController.changeAddress);
router.get('/getAddress',authMiddleWare,addressController.getAddress);


module.exports = router;