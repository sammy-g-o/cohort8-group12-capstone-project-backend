
import Organization from "../models/organizationModel.js";
import AppError from "../utils/appError.js";

export const requireVerifiedOrg = async (req, res, next) => {
  try {
    const organizationId = req.user?.organizationId;

    if (!organizationId) {
      return next(
        new AppError("You must belong to an organization to perform this action", 403),
      );
    }

    const organization = await Organization.findById(organizationId);

    if (!organization || organization.status !== "verified") {
      return next(
        new AppError("Your organization must be verified to perform this action", 403),
      );
    }

    req.organization = organization;
    next();
  } catch (error) {
    next(error);
  }
};
