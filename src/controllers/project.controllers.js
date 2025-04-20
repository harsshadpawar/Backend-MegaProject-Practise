import { asyncHandler } from "../utils/async-handler.js";
import { validate } from "../middlewares/validator.middleware.js";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/api-error.js";
import { AvailableUserRoles } from "../utils/constants.js";

const getProjects = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const userId = req.user._id;

    const projectMembers = await ProjectMember.find({ user: userId });
    const projectIds = projectMembers.map((member) => member.project);

    const projects = await Project.find({ _id: { $in: projectIds } }).populate(
      "createdBy",
      "username fullname",
    );

    res.status(200).json({
      success: true,
      projects,
      message: "Projects retrieved successfully",
    });
  });
});

const getProjectById = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId).populate(
      "createdBy",
      "username fullname",
    );

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const isMember = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (!isMember) {
      throw new ApiError(403, "You don't have access to this project");
    }

    res.status(200).json({
      success: true,
      project,
      message: "Project retrieved successfully",
    });
  });
});

const createProject = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { name, description } = req.body;
    const userId = req.user._id;

    if (!name) {
      throw new ApiError(400, "Project name is required");
    }

    const existingProject = await Project.findOne({
      name,
      createdBy: userId,
    });

    if (existingProject) {
      throw new ApiError(409, "You already have a project with this name");
    }

    const project = await Project.create({
      name,
      description,
      createdBy: userId,
    });

    await ProjectMember.create({
      user: userId,
      project: project._id,
      role: AvailableUserRoles.PROJECT_ADMIN,
    });

    res.status(201).json({
      success: true,
      project,
      message: "Project created successfully",
    });
  });
});

const updateProject = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { projectId } = req.params;
    const { name, description } = req.body;
    const userId = req.user._id;

    const project = await Project.findById(projectId);

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const membership = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (!membership || membership.role !== AvailableUserRoles.PROJECT_ADMIN) {
      throw new ApiError(
        403,
        "You don't have permission to update this project",
      );
    }

    if (name && name !== project.name) {
      const existingProject = await Project.findOne({
        name,
        createdBy: userId,
        _id: { $ne: projectId },
      });

      if (existingProject) {
        throw new ApiError(409, "You already have a project with this name");
      }
    }

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        name: name || project.name,
        description: description || project.description,
      },
      { new: true },
    );

    res.status(200).json({
      success: true,
      project: updatedProject,
      message: "Project updated successfully",
    });
  });
});

const deleteProject = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const membership = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (!membership || membership.role !== AvailableUserRoles.PROJECT_ADMIN) {
      throw new ApiError(
        403,
        "You don't have permission to delete this project",
      );
    }

    await ProjectMember.deleteMany({ project: projectId });
    await Project.findByIdAndDelete(projectId);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  });
});

const getProjectMembers = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { projectId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    const isMember = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (!isMember) {
      throw new ApiError(403, "You don't have access to this project");
    }

    const members = await ProjectMember.find({ project: projectId }).populate(
      "user",
      "username fullname email",
    );

    res.status(200).json({
      success: true,
      members,
      message: "Project members retrieved successfully",
    });
  });
});

const addMemberToProject = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { projectId } = req.params;
    const { email, role } = req.body;
    const userId = req.user._id;

    if (!email) {
      throw new ApiError(400, "Member email is required");
    }

    const project = await Project.findById(projectId);

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // Check if current user has admin rights
    const membership = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (!membership || membership.role !== AvailableUserRoles.PROJECT_ADMIN) {
      throw new ApiError(
        403,
        "You don't have permission to add members to this project",
      );
    }

    // Find user to add by email
    const userToAdd = await User.findOne({ email });

    if (!userToAdd) {
      throw new ApiError(404, "User with this email not found");
    }

    // Check if user is already a member
    const existingMember = await ProjectMember.findOne({
      project: projectId,
      user: userToAdd._id,
    });

    if (existingMember) {
      throw new ApiError(409, "User is already a member of this project");
    }

    // Add user to project with specified role or default to MEMBER
    const newMember = await ProjectMember.create({
      user: userToAdd._id,
      project: projectId,
      role: role || AvailableUserRoles.MEMBER,
    });

    const populatedMember = await ProjectMember.findById(
      newMember._id,
    ).populate("user", "username fullname email");

    res.status(201).json({
      success: true,
      member: populatedMember,
      message: "Member added to project successfully",
    });
  });
});

const deleteMember = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { projectId, memberId } = req.params;
    const userId = req.user._id;

    const project = await Project.findById(projectId);

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // Check if current user has admin rights
    const adminMembership = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (
      !adminMembership ||
      adminMembership.role !== AvailableUserRoles.PROJECT_ADMIN
    ) {
      throw new ApiError(
        403,
        "You don't have permission to remove members from this project",
      );
    }

    // Find the member to remove
    const memberToRemove = await ProjectMember.findById(memberId);

    if (!memberToRemove) {
      throw new ApiError(404, "Project member not found");
    }

    // Prevent removing the project admin (self)
    if (
      memberToRemove.user.toString() === userId.toString() &&
      memberToRemove.role === AvailableUserRoles.PROJECT_ADMIN
    ) {
      throw new ApiError(
        400,
        "You cannot remove yourself as the project admin",
      );
    }

    // Remove the member
    await ProjectMember.findByIdAndDelete(memberId);

    res.status(200).json({
      success: true,
      message: "Member removed from project successfully",
    });
  });
});

const updateMemberRole = asyncHandler(async (req, res) => {
  await validate(req, res, async () => {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const userId = req.user._id;

    if (!role || !AvailableUserRoles.includes(role)) {
      throw new ApiError(400, "Valid role is required");
    }

    const project = await Project.findById(projectId);

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    // Check if current user has admin rights
    const adminMembership = await ProjectMember.findOne({
      project: projectId,
      user: userId,
    });

    if (
      !adminMembership ||
      adminMembership.role !== AvailableUserRoles.PROJECT_ADMIN
    ) {
      throw new ApiError(
        403,
        "You don't have permission to update member roles",
      );
    }

    // Find the member to update
    const memberToUpdate = await ProjectMember.findById(memberId);

    if (!memberToUpdate) {
      throw new ApiError(404, "Project member not found");
    }

    // Prevent changing own role if admin
    if (
      memberToUpdate.user.toString() === userId.toString() &&
      memberToUpdate.role === AvailableUserRoles.PROJECT_ADMIN &&
      role !== AvailableUserRoles.PROJECT_ADMIN
    ) {
      throw new ApiError(400, "You cannot change your own admin role");
    }

    // Update the member's role
    const updatedMember = await ProjectMember.findByIdAndUpdate(
      memberId,
      { role },
      { new: true },
    ).populate("user", "username fullname email");

    res.status(200).json({
      success: true,
      member: updatedMember,
      message: "Member role updated successfully",
    });
  });
});

export {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectById,
  getProjectMembers,
  getProjects,
  updateMemberRole,
  updateProject,
};
