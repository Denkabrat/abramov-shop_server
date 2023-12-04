const Router = require('express');
const router = new Router();
const GoodController = require('../controllers/goodController');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');



router.post('/createGood',checkRoleMiddleware('aedizkddlnrjmixsbo'),GoodController.create);
router.delete('/deleteGood',checkRoleMiddleware('aedizkddlnrjmixsbo'),GoodController.deleteGood);
router.get('/:id',GoodController.getOneGood);
router.get('/', GoodController.getAll);




module.exports = router;