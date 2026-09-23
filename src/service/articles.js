import mongoose from 'mongoose';
import { ArticlesCollection } from '../db/models/articles.js';

export const getArticleByIdOrSlug = async (identifier) => {
  // Определяем, передан ли валидный ObjectId или это slug
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
  const filter = isObjectId ? { _id: identifier } : { slug: identifier };

  const article = await ArticlesCollection.findOneAndUpdate(
    { ...filter, isPublished: true },
    { $inc: { viewsCount: 1 } },
    { new: true }, // Возвращаем обновленный документ
  );

  return article;
};
