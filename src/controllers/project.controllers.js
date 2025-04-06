import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";

const getProjects = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const getProjectById = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const createProject = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const updateProject = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const deleteProject = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const addMemberToProject = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const updateProjectMembers = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

const deleteMember = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

export {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addMemberToProject,
  getProjectMembers,
  updateProjectMembers,
  updateMemberRole,
  deleteMember,
};
