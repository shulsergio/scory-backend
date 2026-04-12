import { getUserProfileData } from '../service/users.js';

export const getUserProfileController = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await getUserProfileData(userId);

    if (!profile) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error('getUserProfile Error:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении профиля' });
  }
};
