import mongoose from 'mongoose';
const { model, Schema } = mongoose;

const articleSchema = new Schema(
  {
    title: { type: String, required: true }, // Заголовок статьи
    slug: { type: String, required: true, unique: true }, // URL: epl-round-5-match-review
    type: {
      type: String,
      enum: ['preview', 'review', 'news', 'analytics'],
      default: 'review',
    }, // Тип: превью, обзор, новость
    excerpt: { type: String, required: true },
    contentBlockOne: { type: String },
    contentBlockTwo: { type: String },
    contentBlockThree: { type: String },
    coverImage: { type: String, required: false },

    // Связь с другими данніми
    leagueSlug: { type: String, index: true },
    matchFotmobId: { type: String, index: true },
    teamSlugs: [{ type: String, index: true }],

    author: {
      name: { type: String, default: 'Scory' },
      avatar: String,
    },
    viewsCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

articleSchema.index({ leagueSlug: 1, publishedAt: -1 });

export const ArticlesCollection = model('articles', articleSchema);
