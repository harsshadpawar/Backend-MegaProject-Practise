import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
} from "../controllers/project.controllers.js";

const router = Router();

// Apply JWT verification middleware to all project routes
router.use(verifyJWT);

// Project CRUD operations
router.route("/").get(getProjects).post(createProject);

router
  .route("/:projectId")
  .get(getProjectById)
  .put(updateProject)
  .delete(deleteProject);

// Project member management
router
  .route("/:projectId/members")
  .get(getProjectMembers)
  .post(addMemberToProject);

router
  .route("/:projectId/members/:memberId")
  .delete(deleteMember)
  .patch(updateMemberRole);

export default router;
