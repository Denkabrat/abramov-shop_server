const { v4: uuidv4 } = require('uuid');
const { YooCheckout } = require('@a2seven/yoo-checkout');
const ApiError = require('../error/ApiError');
const {BasketGood,Basket,Good,Orders,OrdersGoods,UserAddress,UserInformation, OrdersInformation, preOrders} = require('../models/models');
const url = require('url');

const checkout = new YooCheckout({
     shopId: '280876',
     secretKey: 'test_iffW0iM8lUcLDQYrDqXJhsL8seOzShvg2ebdQW1IMAA'
 });



class PaymentController {
    
  async makeOrderWithPayment(req,res,next){

    const userId = req.user.id;
    let basketId;
    
    const myBasket = await Basket.findAll({where:{userId}});
            //получение basketId
             myBasket.forEach(basket => basketId = basket.id);
    
    const getGood = await BasketGood.findAll({where:{basketId}, order: [['createdAt', 'ASC']]});
    
    const getGoodFeature = await Good.findAll(getGood.goodId);
    
    const userCart = getGood.map(goodInformation => {
        const matchingItem = getGoodFeature.find(goodFeature => goodFeature.id === goodInformation.goodId);
            if (matchingItem) {
                return {
                    id:goodInformation.id,
                    goodId:goodInformation.goodId,
                    count:goodInformation.count,
                    size:goodInformation.size,
                    price: matchingItem.price,
                };
            }});
    
    
    const totalCartPrice = userCart.reduce((acc, item) => acc + parseInt(item.price) * item.count, 0);
    const paymentId = uuidv4();
    
    try {
    
        const createPayload = {
            amount: {
                value: totalCartPrice,
                currency: "RUB"
            },
            payment_id: paymentId,
            payment_method_data: {
                type: 'bank_card'
            },
            confirmation: {
                type: 'redirect',
                return_url: 'http://localhost:3000/account'
            },
        };
        
        checkout.createPayment(createPayload, paymentId)
            .then(payment => {
                const urlObj = url.parse(payment.confirmation.confirmation_url, true);
        
                const orderId  = urlObj.query.orderId;
                const userFutureOrder = preOrders.create({userId:userId,price:totalCartPrice,status:"pending",paymentId: orderId});
                
                return { payment, userFutureOrder, orderId }; 
            })
            .then(({payment, userFutureOrder, orderId}) => { 
                res.json(payment.confirmation.confirmation_url);
                return orderId;
            })
            .catch(error => next(ApiError.badRequest("Ошибка при создании заказа")));
    
        
    
    } catch (error) {
        return next(ApiError.badRequest("error"));
    }
    
      
    }

  async paymentSuccess(req, res, next) {
      const userId = req.user.id;
      
          const myBasket = await Basket.findOne({ where: { userId }});
          const basketId = myBasket ? myBasket.id : null;
      
          try {
              const checkOrdersPaid = await preOrders.findAll({
                  where: {
                    userId,
                  },
                  order: [
                    ['createdAt', 'DESC'] // Сортировка по дате создания в убывающем порядке
                  ]
                });
        
            for (let i = 0; i < checkOrdersPaid.length; i++) {
      
        
              const orderId = checkOrdersPaid[i].id;
              const paymentId = checkOrdersPaid[i].paymentId;
      
              const captureResult = await checkout.getPayment(paymentId);
        
              await preOrders.update(
                { status: captureResult.status, paid: captureResult.paid },
                { where: { id: orderId } }
              );
        
              if (captureResult.paid === true) {
                // Копируем данные из preOrders в Orders
                //Не знаю как лучше обработать статусы
                //По умолчанию задал строкой В сборке - тк приходящий статус - статус платежа
                //А ужее в userOrder записывается статус доставки
                const userOrder = await Orders.create({
                  status: 'В сборке',
                  paid: captureResult.paid,
                  price: checkOrdersPaid[i].price,
                  paymentId: checkOrdersPaid[i].paymentId,
                  userId: userId
              });
            
                const basketGoods = await BasketGood.findAll({
                    where: { basketId },
                    order: [['createdAt', 'ASC']],
                });
            
                const [orderAddress, orderInformation] = await Promise.all([
                    UserAddress.findOne({where:{userId:userId}}),
                    UserInformation.findOne({where:{userId:userId}})
                ]);
            
                await OrdersInformation.create({
                    name:orderInformation.name,
                    surname:orderInformation.surname,
                    patronymic:orderInformation.patronymic,
                    phone:orderInformation.phone,
                    city:orderAddress.city,
                    street:orderAddress.street,
                    region:orderAddress.region,
                    index:orderAddress.index,
                    orderId:userOrder.id // Теперь используем id из только что созданного заказа
                });
            
                const newOrdersPromises = basketGoods.map(async (basketGood) => {
                    const newOrder = {
                        goodId: basketGood.goodId,
                        size: basketGood.size,
                        count: basketGood.count,
                        orderId: userOrder.id, // И здесь тоже используем новый id заказа
                    };
            
                    await OrdersGoods.create(newOrder);
                    await BasketGood.destroy({ where: { id: basketGood.id } });
                });
            
                await Promise.all(newOrdersPromises);
            
                // Удаляем запись из preOrders после перенесения ее в Orders
                await preOrders.destroy({ where: { id: orderId } });

            
              }
              //Создание и вывод заказа
              return res.json(captureResult);
      
              }
            
      
          } catch (error) {
            return next(ApiError.badRequest('Ошибка при подтверждении и проверке платежа'));
          }
      }
    
  async getPaymentOrder(req,res,next){
    
    const userId = req.user.id;
      
    const myBasket = await Basket.findOne({ where: { userId }});
    const basketId = myBasket ? myBasket.id : null;

    try {
      const checkOrdersPaid = await Orders.findAll({
        where: {
          userId,
        },
        order: [
          ['createdAt', 'DESC'] // Сортировка по дате создания в убывающем порядке
        ]
      });

  const formattedOrders = await Promise.all(

      checkOrdersPaid.map(async order => {
        const orderId = order.id;
        const date = order.createdAt;
        const price = order.price; 
        const status = order.status;
    
        const orderGoods = await OrdersGoods.findAll({
            where: { orderId },
        });
    
        const orderInformation = await OrdersInformation.findOne({
            where: { orderId },
        });
    
        const formattedGoods = await Promise.all(orderGoods.map(async (good) => {
            const product = await Good.findOne({ where: { id: good.goodId } });
          
              return {
                  id: good.id,
                  name: product.name, // we get the name from the Good table
                  size: good.size,
                  quantity: good.count,
                  image: product.img, // assuming there is an image field in the Good table
              };
        }));
    
        const formattedOrderInformation = {
            name: orderInformation.name,
            surname: orderInformation.surname,
            patronymic: orderInformation.patronymic,
            phone: orderInformation.phone,
            city: orderInformation.city,
            street: orderInformation.street,
            region: orderInformation.region,
            index: orderInformation.index,
        };
    
        const formattedOrder = {
            id: orderId,
            date: date,
            price: price,
            status: status,
            order: formattedGoods,
            information: formattedOrderInformation
        };
    
        return formattedOrder;
    }));
    return res.json(formattedOrders);

    }catch(error){
      return res.json(error)
  }
    

  }

  async getAllOrders(req,res,next) {
    try {
      const orders = await Orders.findAll({
        order: [['createdAt', 'DESC']],
      });
  
      const formattedOrders = await Promise.all(
        orders.map(async (order) => {
          const orderId = order.id;
          const status = order.status;
          const paid = order.paid;
          const amount = order.price;
          const paymentId = order.paymentId;
  
          const orderGoods = await OrdersGoods.findAll({
            where: { orderId },
          });
  
          const orderInformation = await OrdersInformation.findOne({
            where: { orderId },
          });
  
          const formattedGoods = await Promise.all(
            orderGoods.map(async (orderGood) => {
              const good = await Good.findOne({ where: { id: orderGood.goodId } });
  
              return {
                name: good.name,
                quantity: orderGood.count,
                size: orderGood.size,
              };
            })
          );
  
          const formattedOrder = {
            id: orderId,
            status: status,
            paid: paid,
            amount: amount,
            paymentId: paymentId,
            products: formattedGoods,
            customer: {
              firstName: orderInformation.name,
              lastName: orderInformation.surname,
              middleName: orderInformation.patronymic,
              phone: orderInformation.phone,
              city: orderInformation.city,
              street: orderInformation.street,
              region: orderInformation.region,
              zip: orderInformation.index,
              date: order.createdAt.toISOString().split('T')[0], // Преобразуем дату в формат 'гггг-мм-дд'
            },
          };
  
          return formattedOrder;
        })
      );
  
      return res.json(formattedOrders);
    } catch (error) {
      return next(ApiError.badRequest('Ошиба при получении заказов'));
      
    }
  }

  async updateOrderStatus(req, res, next) {
    const { orderId, newStatus } = req.body;
  
    // Проверка валидности orderId
    if (!orderId) {
      return next(ApiError.badRequest('Неверный формат orderId'));
    }
  
    try {
      const order = await Orders.findByPk(orderId);
  
      if (!order) {
        // Вернуть ошибку, если заказ не найден
        return next(ApiError.badRequest('Заказ не найден'));
      }
  
      // Обновить свойство status и сохранить в базе данных
      order.status = newStatus;
      await order.save();
  
      // Вернуть обновленный заказ
      return res.json(order);
    } catch (error) {
      console.error(error);
      return next(ApiError.internal('Ошибка при изменении статуса'));
    }
  }
}
module.exports = new PaymentController();


