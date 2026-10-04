import createHttpError from 'http-errors';
import { getArticleByIdOrSlug } from '../service/articles.js';

export const getArticleBySlugController = async (req, res) => {
  const { slug } = req.params;

  const article = await getArticleByIdOrSlug(slug);

  if (!article) {
    throw createHttpError(404, 'Статтю не знайдено');
  }

  res.status(200).json({
    status: 200,
    message: 'Done',
    data: article,
  });
};
