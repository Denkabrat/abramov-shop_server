const ApiError = require('../error/ApiError');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {User,Basket,UserAddress,UserInformation} = require('../models/models');
    //функция по генерации токена
const generateJwt = (id, email, roles) => {

    return jwt.sign({id, email, roles}, 
                    process.env.SECRET_KEY,
                    {expiresIn:'24h'});
}


class UserController {
    
    //регистрация
    async registration(req,res,next){
        //ввод данных в поля
        const {email,password,secondPassword,roles} = req.body;
        //условие на проверку данных и вывод ошибки
        if(!email || !password || !secondPassword){
            return next(ApiError.badRequest('Некоректный E-mail или Пароль'))
        }
        //проверка существует ли пользователь или нет
        const candidate = await User.findOne({where:{email}});
        //выброс ошибки
        if(candidate){
            return next(ApiError.badRequest('Пользователь с таким E-mail уже существует'))
        }
        //хеширование пароля пользователя
        const hashPassword = await bcrypt.hash(password,5);
            //регистрация пользовалтеля при соблюдении условия
        if(secondPassword === password){
            const user = await User.create({email,roles:roles,password:hashPassword});
            const basket = await Basket.create({userId: user.id});
            const userInformation = await UserInformation.create({userId:user.id,email:user.email});
            const userAddress = await UserAddress.create({userId:user.id});
                //генерация токена с данными пользователя
            const token = generateJwt(user.id,user.email,user.roles);

                return res.json(token);

        }else{
            return next(ApiError.badRequest('Пароли не совпадают'))
        }

        
    
    }
    //авторизация
    async login(req,res,next){
        //ввод данных в строку и поиск по базе данных
        const {email,password} = req.body;
        const user = await User.findOne({where:{email}});

        if(!user){
            return next(ApiError.internal('Пользователь не найден'));
        }
        //ввод и проверка пароля
        let comparePassword = bcrypt.compareSync(password,user.password);


        if(!comparePassword){
            return next(ApiError.internal('Неверный пароль'));
        }
        //генерация токена пользователя
        const token = generateJwt(user.id, user.email, user.roles);

            return res.json({token});


    }
    //проверка авторизации - нужна для работы с корзиной 
    async checkAuthorization(req,res,next){
        
        const token = generateJwt(req.user.id, req.user.email, req.user.roles);

            return res.json(token);
        
    }
    //удаление пользователя - на данный момент не доступно на фронтенде,
    //будет использовано у пользователя либо в админке ,возможно там и там
    async deleteUser(req,next){

        const {email,password} = req.body;
        //ввод данных и поиск пользователя,корзины,информвции и адреса пользователя

        const userDelete = await User.findOne({where:{email}});
        const basket = await Basket.findOne({where:{userId: userDelete.id}});
        const userInfo = await UserInformation.findOne({where:{userId: userDelete.id}})
        const userAddress = await UserAddress.findOne({where:{userId: userDelete.id}})

            if(!userDelete){
                return next(ApiError.internal('Данный E-mail не существует'));
            }

            //удаление всех ячеек пользователя
        let comparePassword = bcrypt.compareSync(password,userDelete.password);
            if(comparePassword){
                userDelete.destroy();
                userInfo.destroy();
                userAddress.destroy();
                basket.destroy();
            }else{
                return next(ApiError.internal('Неверный пароль'));
            }

        return next(ApiError.deleted('Аккаунт был успешно удалён'));

        
    }
    async getAllUsers(req, res, next) {
        try {
          const allUsers = await User.findAll({
            order: [['id', 'ASC']]
          });
      
          const userInfoArray = [];
      
          for (let user of allUsers) {
            const userInfo = await UserInformation.findOne({ where: { userId: user.id } });
      
            const userObject = {
              id: user.id,
              name: userInfo.name,
              surname: userInfo.surname,
              patronymic: userInfo.patronymic,
              phone: userInfo.phone,
              email: user.email
            };
      
            userInfoArray.push(userObject);
          }
      
          return res.json(userInfoArray);
        } catch (error) {
          return next(ApiError.badRequest(error));
        }
      }


}

module.exports = new UserController();
