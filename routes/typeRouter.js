const Router = require('express');
const router = new Router();
const TypeController = require('../controllers/typeControllers');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');

router.post('/createType', checkRoleMiddleware('aedizkddlnrjmixsbo'), TypeController.create);
router.get('/getAllTypes',TypeController.getAll);
router.get('/:route',TypeController.getOneType);
router.delete('/delete',checkRoleMiddleware('aedizkddlnrjmixsbo'),TypeController.deleteByName);



module.exports = router;