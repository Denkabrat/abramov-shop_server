const {Type,Good} = require('../models/models');
const ApiError = require('../error/ApiError');

class TypeController {
    //создание типа одежды или же вида - доступно только админам
    async create(req,res,next){
        try{
            //ввод данных и запрос на создание ячейки
            const {name,route} = req.body;
            const type = await Type.create({name,route});

                 return res.json(type);
        }catch(e){
            next(ApiError.badRequest('Ошибка при создании типа'))
        }
    }
    //получени типов - для вывода в хедер и постранично
    async getAll(req,res){
        const types = await Type.findAll();
             return res.json(types);
    }
    //получение одного типа для динамического роутинга и заголовков
    async getOneType(req,res){
            const {route} = req.params;
            //ввод информации и поиск
            const type = await Type.findOne(
                {
                    where:{route},
                }
            )
                return res.json(type);
        
    }

    async deleteByName(req, res, next) {
        try {
            const { typeName } = req.body; 

            // Находим тип по названию
            const type = await Type.findOne({ where: { name: typeName } });

            if (!type) {
                return next(ApiError.badRequest('Тип не найден'));
            }

            const {id} = type;
            
            // Удаляем найденный тип
            await Good.destroy({ where: { typeId: id } });
            await type.destroy();

            return res.json({ message: `Тип ${typeName} успешно удален` });
        } catch (e) {
            next(ApiError.internal('Ошибка при удалении типа'));
        }
    }


}

module.exports = new TypeController();