import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import ordersRouter from "./orders";
import paymentsRouter from "./payments";
import couponsRouter from "./coupons";
import bannersRouter from "./banners";
import chatRouter from "./chat";
import adminRouter from "./admin";
import usersRouter from "./users";
import paymentSettingsRouter from "./payment-settings";
import storageRouter from "./storage";
import seedRouter from "./seed";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(paymentsRouter);
router.use(couponsRouter);
router.use(bannersRouter);
router.use(chatRouter);
router.use(adminRouter);
router.use(usersRouter);
router.use(paymentSettingsRouter);
router.use(storageRouter);
router.use(seedRouter);

export default router;
