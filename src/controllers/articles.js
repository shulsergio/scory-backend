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

  const filter = {
    isPublished: true,
  };

  if (slug !== 'all') {
    filter.leagueSlug = slug;
  }

  let query = ArticlesCollection.find(filter)
    .sort({ _id: -1 })
    .select(
      'leagueName title slug excerpt coverImage teamsIds playersIds createdAt',
    )
    .populate('teamsIds', 'name shortName')
    .populate('playersIds', 'name slug')
    .lean();

  if (slug !== 'all') {
    query = query.limit(50);
  }

  const news = await query;

  res.status(200).json({
    status: 200,
    message: 'Done',
    data: news,
  });
};

export const getArticlesByTeamController = async (req, res) => {
  const { teamId } = req.params;

  const news = await ArticlesCollection.find({
    teamsIds: teamId,
    isPublished: true,
  })
    .sort({ _id: -1 })
    .select(
      'leagueName title slug excerpt coverImage teamsIds playersIds createdAt',
    )
    .populate('teamsIds', 'name shortName slug')
    .populate('playersIds', 'name slug')
    .limit(50)
    .lean();

  res.status(200).json({
    status: 200,
    message: 'Done',
    data: news,
  });
};

export const getArticlesByPlayerController = async (req, res) => {
  const { playerId } = req.params;

  const news = await ArticlesCollection.find({
    playersIds: playerId,
    isPublished: true,
  })
    .sort({ _id: -1 })
    .select(
      'leagueName title slug excerpt coverImage teamsIds playersIds createdAt',
    )
    .populate('teamsIds', 'name shortName slug')
    .populate('playersIds', 'name slug')
    .limit(50)
    .lean();

  res.status(200).json({
    status: 200,
    message: 'Done',
    data: news,
  });
};
