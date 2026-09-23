import mongoose from 'mongoose';
const { model, Schema } = mongoose;

const articleSchema = new Schema(
  {
    title: { type: String, required: true }, // Заголовок статьи
    slug: { type: String, required: true, unique: true }, // URL: epl-round-5-match-review
    type: {
      type: String,
      enum: ['preview', 'review', 'news', 'analytics'],
      default: 'news',
    }, // Тип: превью, обзор, новость
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: String, required: false },

    // 💡 Связи с другими сущностями
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

export const ArticleCollection = model('articles', articleSchema);
