const {UserAddress} = require('../models/models');
const ApiError = require('../error/ApiError');

class PersonalAddressController {

    //изменение данных об адресе пользователя
    async changeAddress(req,res,next){
        try{
            //происходит ввод данных и отправка json,далее происходит обновление
            //тех полей, который выбрал пользователь
            const userId = req.user.id;
            const {city,street,region,index} = req.body;
            //поиск
              const userAddress = await UserAddress.findOne({where:{userId}});
            //обновление
              await userAddress.update({city,street,region,index});
          
                 return res.json(userAddress);

        }catch(e){
            next(ApiError.badRequest('Ошибка при изменении данных'))
        }
    }
    //получение адреса пользователя
    async getAddress(req,res){
        const userId = req.user.id;
        const address = await UserAddress.findOne({where:{userId}});

             return res.json(address);
    }

}

module.exports = new PersonalAddressController();
