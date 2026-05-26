import {
  getUserProfileData,
  updateUserSettingsService,
} from '../service/users.js';

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

export const updateUserSettingsController = async (req, res, next) => {
  const userId = req.user._id; // ID текущего залогиненного юзера из мидлвара
  const { name, country } = req.body;

  try {
    if (!name) {
      return res
        .status(400)
        .json({ message: 'Имя обязательно для заполнения' });
    }

    const updatedUser = await updateUserSettingsService(userId, {
      name,
      country,
    });

    res.status(200).json({
      status: 200,
      message: 'Настройки профиля успешно обновлены',
      data: {
        name: updatedUser.userName,
        country: updatedUser.country,
      },
    });
  } catch (error) {
    next(error);
  }
};
