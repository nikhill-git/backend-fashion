const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      const { user } = req;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
      }


      if (!user.isAccountVerified || !user.isAccountActive) {
        return res.status(400).json({
          success: false,
          message: "Not a valid account",
        });
      }

      const isAuthorized = allowedRoles.includes(user.role)

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          message: "You are not a authorized user to access this route",
        });
      }

      next();
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message || " Oops something went wrong",
      });
    }
  };
};

module.exports = {authorize}
