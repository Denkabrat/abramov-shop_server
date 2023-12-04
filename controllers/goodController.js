const uuid = require('uuid');
const path = require('path');
const { Good } = require('../models/models');
const ApiError = require('../error/ApiError');


class GoodController {
    //добавление товара - функция для админки
    async create(req, res, next) {
        try {
          // Добавление данных для создания карточки товара
          const { name, price, typeId, information } = req.body;
          const { img } = req.files;
          let allImages = [];
    
          if (img instanceof Array) {
            // Если img - это массив файлов, например, при загрузке нескольких файлов
            allImages = await Promise.all(
              img.map(async (item) => {
                const fileName = uuid.v4() + '.jpg';
                await item.mv(path.resolve(__dirname, '..', 'static', fileName));
                return fileName;
              })
            );
          } else {
            // Если img - это один файл
            const fileName = uuid.v4() + '.jpg';
            await img.mv(path.resolve(__dirname, '..', 'static', fileName));
            allImages.push(fileName);
          }
    
          // Создание карточки
          const good = await Good.create({ name, price, typeId, img: allImages, information });
    
          return res.json(good);
        } catch (e) {
          next(ApiError.badRequest(e.message));
        }
      }
    //получение всех товаров
    async getAll(req,res){
        //простая логика получение по typeId
        const {typeId} = req.query;

        let goods;

        if(!typeId){
            goods = await Good.findAndCountAll();
        }else{
            goods = await Good.findAndCountAll({where:{typeId}});
        }

        return res.json(goods);
    }
    //получение одного товара для роутинга
    async getOneGood(req, res, next) {
      try {
          const { id } = req.params;
  
          const good = await Good.findOne({
              where: { id },
          });
  
          if (!good) {
              return res.status(404).json({ error: 'Resource not found' });
          }
  
          return res.json(good);
  
      } catch (error) {
          // Handle other errors and return an internal server error response
          return next(ApiError.internal('Ошибка'));
      }
  }
    //удаление товара - функция для админки
    async deleteGood(req,res,next){
        //логика проста - вводишь название товара и отправляешь запрос
        const {name} = req.body;

        const good = await Good.findOne({where:{name}});

            if(!good){
                return next(ApiError.internal('Данный товар не существует'));
            }

            if(name == good.name){
            good.destroy();
            }else{
                return next(ApiError.internal('Неверный id'));
            }

        return next(ApiError.deleted('Товар был успешно удалён'));
    }
     
}

module.exports = new GoodController();
