import express from "express";
import Users from "../controllers/Users";
import Avatars from "../controllers/Avatars";
import Beneficents from "../controllers/Beneficents";
import UsersBankAccounts from "../controllers/UsersBankAccounts";
import UsersAddresses from "../controllers/UsersAddresses";
import Donations from "../controllers/Donations";
import Acknowledgments from "../controllers/Acknowledgments";
import Cashier from "../controllers/Cashier";
import Passwords from "../controllers/Passwords";
import Session from "../controllers/Session";
import authMiddleware from "../middlewares/authMiddleware";
import uploadMiddleware from "../middlewares/uploadMiddleware";

const router = express.Router();

router.get("/users/beneficents", authMiddleware, Beneficents.index);

router.post("/users/:id/avatars", authMiddleware, uploadMiddleware, Avatars.update);

router.post("/users", Users.create);

router.put("/users/:id", authMiddleware, Users.update);

router.get("/users/:id", authMiddleware, Users.view);

router.patch("/users/:id/password-change", authMiddleware, Passwords.update);

router.post("/users/sessions", Session.create);

router.post("/users/:idUsers/bank-accounts", authMiddleware, UsersBankAccounts.create);

router.put("/users/:idUsers/bank-accounts/:idBankAccounts", authMiddleware, UsersBankAccounts.update);

router.get("/users/:idUsers/bank-accounts/:idBankAccounts", authMiddleware, UsersBankAccounts.view);

router.post("/users/:idUsers/addresses", authMiddleware, UsersAddresses.create);

router.put("/users/:idUsers/addresses/:idUsersAddresses", authMiddleware, UsersAddresses.update);

router.get("/users/:idUsers/addresses/:idUsersAddresses", authMiddleware, UsersAddresses.view);

router.post("/users/:id/donations", authMiddleware, Donations.create);

router.get("/users/:id/donations/:status", authMiddleware, Donations.view);

router.post("/donations/:id/accept", authMiddleware, Donations.update);

router.post("/donations/:id/refuse", authMiddleware, Donations.update);

router.post("/users/:idUsers/donations/:idDonations/to-thank", authMiddleware, Acknowledgments.update);

router.put("/users/:id/donations/transfer-money", authMiddleware, Cashier.update);

export default router;
