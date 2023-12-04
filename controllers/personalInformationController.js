const {UserInformation} = require('../models/models');
const ApiError = require('../error/ApiError');

class PersonalInformationController {
    //смена информации
    async changeInfo(req,res,next){
        try{
            //происходит ввод данных и отправка json,далее происходит обновление
            //тех полей, который выбрал пользователь
            const userId = req.user.id;
            const {name,surname,patronymic,phone,email,} = req.body;
            //поиск по айди пользователя
             const userInformation = await UserInformation.findOne({where:{userId}});
            //обновление информации
             await userInformation.update({name,surname,patronymic,phone,email});
          
                 return res.json(userInformation);

        }catch(e){
            next(ApiError.badRequest('Ошибка при изменении данных'))
        }
    }
    //получение информации
    async getInformation(req,res){
        const userId = req.user.id;

        const information = await UserInformation.findOne({where:{userId}});

             return res.json(information);
    }

}

module.exports = new PersonalInformationController();