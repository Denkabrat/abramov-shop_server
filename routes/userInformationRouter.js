const Router = require('express');
const router = new Router();
const userController = require('../controllers/personalInformationController');
const authMiddleWare = require('../middleware/authMiddleWare');


router.put('/changeInfo',authMiddleWare,userController.changeInfo);
router.get('/getInfo',authMiddleWare,userController.getInformation);


module.exports = router;