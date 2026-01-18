import { createGroup } from "../service/groups";

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
