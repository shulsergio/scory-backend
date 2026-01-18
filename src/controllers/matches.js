/**
 *--контроллер для получения всех матчей--
 * Получает все матчи из базы данных и возвращает их в ответе.
 * @param {*} req
 * @param {*} res
 * @param {*} next
 * @export
 * @return {*}
 */
export const getAllMatchesController = async (req, res, next) => {
  try {
    const matches = [];
    res.status(200).json(matches);
  } catch (error) {
    next(error);
  }
};
