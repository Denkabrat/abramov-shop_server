const {BasketGood,Basket,Good} = require('../models/models');
const ApiError = require('../error/ApiError');



class BasketController{
    //добавление в корзину
    async create(req,res,next){
        //получение всех необходимых данных для работы
        const {goodId,size}= req.body;
        const userId = req.user.id;
        let basketId;
        //массив который заполняется данными о товарах в коризне
        //и в последующем служит для сравнения данных есть ли они или нет
        let goodsArray = [];
        
        
        const addGood = await Basket.findAll({where:{userId}});

            addGood.forEach(basket => basketId = basket.id);
        //получение размеров и айди,что есть 
        const getGoods = await BasketGood.findAll({where:{basketId}});

            getGoods.forEach(goods => goodsArray.push({size:goods.size,goodId:goods.goodId}));
        //проверка есть ли товар уже в корзине | any goodId in basket
        //если есть то count + 1 && count < 20
        //если нет то уведомление ,что больше нельзя добавить данный товар
        //либо можно но с другим размеро и так же до 20шт
        let checkGoodInDB = goodsArray.some(goodInformation => goodInformation.goodId == goodId && goodInformation.size == size)
                    if (checkGoodInDB){
                        //поиск в бд нужного товара
                        const getOneGood = await BasketGood.findOne({where:{basketId,goodId,size}});
                            if(getOneGood && getOneGood.count < 20 && getOneGood.size === size){
                                 getOneGood.update({count: getOneGood.count + 1});
                                 return res.json(getOneGood);
                            }                 
                            else{
                                return next(ApiError.badRequest('Достигнут лимит по колличеству данного товара в корзине'));
                            }
                    }else{
                        if(!size){
                            return next(ApiError.badRequest('Не выбран размер !'));
                        }
                        //добавление нового товара в корзину если было нарушено условие и изменен размер
                        const basketGood = await BasketGood.create({basketId:basketId,goodId:goodId,size:size});
                           return res.json(basketGood);
                    }
    }
    //получение всех товаров из корзины
    async getAllGood(req,res){

        const userId = req.user.id;
        let basketId;
        //ищем нужную корзиную по userId ,далее ищем товары добавленые в 
        //корзину.Далее ищем точно такие-же товары в списке всех товаров
        //Получается если в корзине есть футболка то идет поиск футболки в ассортименте товаров
        const myBasket = await Basket.findAll({where:{userId}});
            //получение basketId
             myBasket.forEach(basket => basketId = basket.id);
            //получение товаров в корзине
        const getGood = await BasketGood.findAll({where: {basketId}, order: [['createdAt', 'ASC']]});
            //получение товаров из ассоритимнета ,которые есть в корзине
        const getGoodFeature = await Good.findAll(getGood.goodId);
            //создание нового массива с карточками товаров для корзины

       const userCart = getGood.map(goodInformation => {
            const matchingItem = getGoodFeature.find(goodFeature => goodFeature.id === goodInformation.goodId);
                if (matchingItem) {
                    return {
                        id:goodInformation.id,
                        goodId:goodInformation.goodId,
                        typeId:matchingItem.typeId,
                        count:goodInformation.count,
                        size:goodInformation.size,
                        name: matchingItem.name,
                        price: matchingItem.price,
                        img: matchingItem.img,
                    };
                }});

        const totalPrice = userCart.reduce((acc, item) => acc + parseInt(item.price) * item.count, 0);

            const response = {
                totalPrice,
                userCart
            }
            return res.json(response);
          
    }   
    //изменение колличества и удаление
    async changeGoodCountAndDelete(req,res,next){

        try {
            //находим нужный товар по размеру и id
            const {size,goodId,action}= req.body;
            const userId = req.user.id;
            let basketId;
            //ищем нужную корзину то есть basketId
            const changeGood = await Basket.findAll({where:{userId}});
            
                changeGood.forEach(basket => basketId = basket.id);
            //находим нужный товар у которого будем менять колличество
            const newGoodCount = await BasketGood.findOne({where:{goodId,basketId,size}});
            //условие на увлечение товара и уменьшение
            //так же реализована система удаления если счестчик равен 0 то товар удаляется из корзины
        switch (action) {
            case 'inc':
                if(newGoodCount.count < 20){
                    newGoodCount.update({ count: newGoodCount.count + 1 });
                }else{
                    return next(ApiError.badRequest('Нельзя добавить больше 20 единиц товара!'));
                }
                break;
            case 'dec':
                if (newGoodCount.count > 0) {
                    newGoodCount.update({ count: newGoodCount.count - 1 });
                }
                if (newGoodCount.count === 0) {
                    newGoodCount.destroy();
                    return next(ApiError.deleted('Товар удален из корзины!'));
                }
                break;
            default:
                // break;
            }
                return res.json(newGoodCount);

        } catch (error) {
            return next(ApiError.badRequest(error));
        }
    }
}

module.exports = new BasketController();
