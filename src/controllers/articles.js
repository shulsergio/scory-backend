import createHttpError from 'http-errors';
import { getArticleByIdOrSlug } from '../service/articles.js';
import { ArticlesCollection } from '../db/models/articles.js';

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

export const getAllArticlesBySlug = async (req, res) => {
  const { slug } = req.params;

  const news = await ArticlesCollection.find({
    leagueSlug: slug,
    isPublished: true,
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .select('title slug excerpt coverImage createdAt')
    .lean();

  if (!news) {
    throw createHttpError(404, 'Статтю не знайдено');
  }

  res.status(200).json({
    status: 200,
    message: 'Done',
    data: news,
  });
};
