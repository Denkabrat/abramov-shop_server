const sequelize = require('../db');
const {DataTypes} = require('sequelize');

const User = sequelize.define('user', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
    password: {
        type: DataTypes.STRING
    },
    roles: {
        type: DataTypes.STRING,
        defaultValue: 'utvriworrmpszvuzzqi'
    },
});

const Basket = sequelize.define('basket', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
});

const BasketGood = sequelize.define('basket_good', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    size: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    count: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    }
});

const Good = sequelize.define('goods', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    price: {
        type: DataTypes.STRING,
        allowNull: false
    },
    img: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: false
    },
    information: {
        type: DataTypes.STRING,
        allowNull: false
    },
});

const Type = sequelize.define('type', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    //роут использовался для того,чтобы вывести все типы и их названия постранично
    route: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
});

const UserInformation = sequelize.define('user_information', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
    },
    surname: {
        type: DataTypes.STRING,
    },
    patronymic: {
        type: DataTypes.STRING,
    },
    phone: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
        unique: true
    },
});

const UserAddress = sequelize.define('address_information', {
    city: {
        type: DataTypes.STRING,
    },
    street: {
        type: DataTypes.STRING,
    },
    region: {
        type: DataTypes.STRING,
    },
    index: {
        type: DataTypes.INTEGER,
    }
});

const Orders = sequelize.define('orders', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    price: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    paymentId: {
        type: DataTypes.STRING,
        allowNull: true
    },
});

const preOrders = sequelize.define('pre_orders', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    status: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    paid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    price: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    paymentId: {
        type: DataTypes.STRING,
        allowNull: true
    },
});

const OrdersGoods = sequelize.define('orders_good', {

    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    goodId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    size: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    count: {
        type: DataTypes.INTEGER,
        defaultValue: 1
    },
});

const OrdersInformation = sequelize.define('orders_information', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
    },
    surname: {
        type: DataTypes.STRING,
    },
    patronymic: {
        type: DataTypes.STRING,
    },
    phone: {
        type: DataTypes.STRING,
    },
    city: {
        type: DataTypes.STRING,
    },
    street: {
        type: DataTypes.STRING,
    },
    region: {
        type: DataTypes.STRING,
    },
    index: {
        type: DataTypes.INTEGER,
    }
})


User.hasOne(Basket);
Basket.belongsTo(User);

Basket.hasMany(BasketGood);
BasketGood.belongsTo(Basket);

Type.hasMany(Good);
Good.belongsTo(Type);

Good.hasMany(BasketGood);
BasketGood.belongsTo(Good);

User.hasOne(UserInformation);
UserInformation.belongsTo(User);

User.hasOne(UserAddress);
UserAddress.belongsTo(User);

User.hasMany(Orders);
Orders.belongsTo(User);

Orders.hasMany(OrdersGoods);
OrdersGoods.belongsTo(Orders);

Orders.hasMany(OrdersInformation);
OrdersInformation.belongsTo(Orders);

User.hasMany(preOrders);
preOrders.belongsTo(User);


module.exports = {
    User,
    Basket,
    BasketGood,
    Good,
    Type,
    UserAddress,
    UserInformation,
    Orders,
    OrdersGoods,
    OrdersInformation,
    preOrders
}