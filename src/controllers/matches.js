export const getAllMatchesController = async (req, res, next) => {
  try {
    const matches = [];
    res.status(200).json(matches);
  } catch (error) {
    next(error);
  }
};
