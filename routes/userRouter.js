const Router = require('express');
const router = new Router();
const userController = require('../controllers/userController');
const AuthMiddleware = require('../middleware/authMiddleWare');
const checkRoleMiddleware = require('../middleware/checkRoleMiddleware');



router.post('/registration',userController.registration);
router.post('/login',userController.login);
router.get('/auth', AuthMiddleware, userController.checkAuthorization);
router.delete('/delete',userController.deleteUser);
router.get('/getAllUsers',checkRoleMiddleware('aedizkddlnrjmixsbo'),userController.getAllUsers);



module.exports = router;