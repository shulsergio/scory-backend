import createHttpError from 'http-errors';
import { getArticleByIdOrSlug } from '../service/articles';

export const getArticleByIdController = async (req, res) => {
  const { articleId } = req.params;

  const article = await getArticleByIdOrSlug(articleId);

  if (!article) {
    throw createHttpError(404, 'Статтю не знайдено');
  }

  res.status(200).json({
    status: 200,
    message: 'Done',
    data: article,
  });
};
