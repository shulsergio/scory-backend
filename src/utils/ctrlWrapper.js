/**
 * --обертка для контроллеров с обработкой ошибок--
 * @param {*} ctrl
 * @returns
 */
export const ctrlWrapper = (ctrl) => {
  return async (req, res, next) => {
    try {
      await ctrl(req, res, next);
    } catch (error) {
      console.error('Error in controller wrapper:', error);
      next(error);
    }
  };
};
