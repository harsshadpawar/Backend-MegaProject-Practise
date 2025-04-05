import { asyncHandler } from "../utils/async-handler.js";
import { ApiResponse } from "../utils/api-response.js";

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  //validation
});

export { registerUser };
