import { createGroup, getGroupLeaderboard } from '../service/groups.js';

/**
 * --контроллер для создания группы--
 * создает новую группу с заданным именем и администратором.
 * name - название группы
 * adminId - id пользователя, создающего группу
 *
 * @param {*} req
 * @param {*} res
 * @export
 * @return {*}
 */
export const createGroupController = async (req, res) => {
  const { name } = req.body;
  const adminId = req.user._id;
  if (!name) {
    return res.status(400).json({ message: 'Group name is required' });
  }

  const group = await createGroup(name, adminId);

  res.status(201).json({
    status: 201,
    message: 'Group successfully created!',
    data: group,
  });
};

/**
 * --контроллер для получения результатов группы--
 * groupId - идентификатор группы
 * @param {*} req
 * @param {*} res
 * @export
 * @return {*}
 */
export const getGroupResultsController = async (req, res) => {
  const { groupId } = req.params;

  try {
    const results = await getGroupLeaderboard(groupId);

    res.status(200).json({
      status: 200,
      message: 'Successfully fetched group results',
      data: results,
    });
  } catch (error) {
    if (error.message === 'Group not found') {
      return res.status(404).json({ message: error.message });
    }
    throw error; // Это подхватит твой ctrlWrapper
  }
};
