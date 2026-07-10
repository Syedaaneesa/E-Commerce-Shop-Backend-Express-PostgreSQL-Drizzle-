import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import brandsRouter from "./brands";
import productsRouter from "./products";
import reviewsRouter from "./reviews";
import homeRouter from "./home";
import cartRouter from "./cart";
import wishlistRouter from "./wishlist";
import addressesRouter from "./addresses";
import couponsRouter from "./coupons";
import ordersRouter from "./orders";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(brandsRouter);
router.use(productsRouter);
router.use(reviewsRouter);
router.use(homeRouter);
router.use(cartRouter);
router.use(wishlistRouter);
router.use(addressesRouter);
router.use(couponsRouter);
router.use(ordersRouter);
router.use(adminRouter);

export default router;
