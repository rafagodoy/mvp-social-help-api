import { sequelize } from "../config/sequelize";
import { donationsSchema } from "../validations/donations";
import validateSchema from "../validations/validateSchema";
import throwError from "../helpers/throwError";
import donations from "../models/donations";
import users from "../models/users";
import users_donations from "../models/users_donations";
import cashier from "../models/cashier";

class Donations {
    async create(req, res, next) {
        const t = await sequelize.transaction();

        try {
            const { hasErrorValidation, error } = await validateSchema(req.body, donationsSchema, next);

            if (hasErrorValidation) {
                return throwError(400, error, next);
            }

            if (!(await users.findOne({ where: { id_users: parseInt(req.headers.id_user), type_user: "donator" } }))) {
                return throwError(403, "The id_user_from must be a donator user", next);
            }

            if (!(await users.findOne({ where: { id_users: parseInt(req.params.id), type_user: "beneficent" } }))) {
                return throwError(403, "The id_user_to must be a beneficent user", next);
            }

            const donation = await donations.create(
                {
                    value_donation: req.body.value_donation,
                    note: req.body.note,
                    id_status_donations: 1,
                    date_donation: new Date(),
                    UsersDonation: [
                        {
                            id_user_from: parseInt(req.headers.id_user),
                            id_user_to: req.params.id,
                        },
                    ],
                },
                {
                    include: [
                        {
                            model: users_donations,
                            as: "UsersDonation",
                        },
                    ],
                    transaction: t,
                }
            );

            await t.commit();

            res.status(200).json({ status: "true", donation });
        } catch (error) {
            await t.rollback();
            throwError(500, error, next);
        }
    }

    async view(req, res, next) {
        try {
            if (req.params.status !== "received" && req.params.status !== "sent") {
                return throwError(403, "Error to request information", next);
            }

            if (parseInt(req.params.id) !== parseInt(req.headers.id_user)) {
                return throwError(403, "You don't have permission for view donations this user", next);
            }

            switch (req.params.status) {
                case "received":
                    const donators = await users_donations.findAll({
                        attributes: ["id_users_donations"],
                        where: { id_user_to: parseInt(req.headers.id_user) },
                        include: [
                            {
                                model: users,
                                as: "Donator",
                                attributes: ["id_users", "name", "last_name"],
                            },
                            {
                                model: donations,
                                as: "Donation",
                                attributes: [
                                    "id_donations",
                                    "value_donation",
                                    "date_donation",
                                    "acknowledgment",
                                    "note",
                                ],
                                where: { id_status_donations: 2 },
                            },
                        ],
                    });

                    res.status(200).json({ status: "true", donators });

                    break;

                case "sent":
                    const contributions = await users_donations.findAll({
                        attributes: ["id_users_donations"],
                        where: { id_user_from: parseInt(req.headers.id_user) },
                        include: [
                            {
                                model: users,
                                as: "Beneficents",
                                attributes: ["id_users", "name", "last_name"],
                            },
                            {
                                model: donations,
                                as: "Donation",
                                attributes: [
                                    "id_donations",
                                    "value_donation",
                                    "date_donation",
                                    "acknowledgment",
                                    "note",
                                    "id_status_donations",
                                ],
                            },
                        ],
                    });

                    res.status(200).json({ status: "true", contributions });

                    break;
            }
        } catch (error) {
            console.log(error);
            throwError(500, error, next);
        }
    }

    //TODO:
    //Futuramente, ao integrar a forma de pagamento, esse trecho deverá ter token de acesso apenas por um usuário administrador na API.
    async update(req, res, next) {
        const t = await sequelize.transaction();

        try {
            if (!req.params.id) {
                return throwError(403, "The id_donations doesn't exist", next);
            }

            if (!req.params.status || (req.params.status !== "accept" && req.params.status !== "refuse")) {
                return throwError(403, "The donation status needs be infomed", next);
            }

            if (await cashier.findOne({ where: { id_donations: parseInt(req.params.id) } })) {
                return throwError(403, "The donation number has been exists in beneficent cashier", next);
            }

            req.route.path.includes("accept") ? 2 : req.route.path.includes("refuse") ? 3 : null;

            await donations.update(
                { id_status_donations: parseInt(req.params.status) },
                { where: { id_donations: parseInt(req.params.id) }, transaction: t }
            );

            if (req.params.status === 2) {
                const donation = await users_donations.findOne({ where: { id_donations: parseInt(req.params.id) } });

                await cashier.create(
                    {
                        id_users: donation.id_user_to,
                        id_donations: donation.id_donations,
                        status: "pending",
                        date_last_update: new Date(),
                    },
                    { transaction: t }
                );
            }

            await t.commit();

            res.status(200).json({ status: "true", message: "The donation status updated successfully" });
        } catch (error) {
            await t.rollback();
            throwError(500, error, next);
        }
    }
}

export default new Donations();
