import { Sequelize, DataTypes, Model } from "sequelize";

const Op = Sequelize.Op;

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    timezone: "-03:00",
    dialect: process.env.DB_DIALECT,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
    define: {
        timestamps: false,
        freezeTableName: true,
    },
});

export { sequelize, Model, DataTypes, Op };
