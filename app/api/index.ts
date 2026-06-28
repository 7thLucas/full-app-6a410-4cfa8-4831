import { Router } from "express";
// Import global routes
import routes from "./routes";
import { initializeModels } from "./models";

// Cinq core-loop backend (lives under app/cinq, outside the auto-discovered
// app/modules/* tree, so it is wired in explicitly here).
import "~/cinq/requests/request.model";
import cinqRequestRoutes from "~/cinq/requests/request.routes";

// Initialize models
await initializeModels();

const router = Router();
router.use(routes);
router.use(cinqRequestRoutes);

export default router;
