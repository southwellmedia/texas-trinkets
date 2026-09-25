import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

// Blog collection with Content Layer API
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string().max(100),
      description: z.string().max(200),
      publishedAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      author: z.string().default('Team'),
      image: image().optional(),
      imageAlt: z.string().optional(),
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(false),
      featured: z.boolean().default(false),
      locale: z.enum(['en', 'es', 'fr']).default('en'),
    }),
});

// Pages collection for static pages
const pages = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    updatedAt: z.coerce.date().optional(),
    locale: z.enum(['en', 'es', 'fr']).default('en'),
  }),
});

// Authors collection
const authors = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/authors' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      bio: z.string(),
      avatar: image().optional(),
      social: z
        .object({
          twitter: z.string().optional(),
          github: z.string().optional(),
          linkedin: z.string().optional(),
        })
        .optional(),
    }),
});

// FAQs collection (for JSON-LD FAQ schema)
const faqs = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/faqs' }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    category: z.string().optional(),
    order: z.number().default(0),
    locale: z.enum(['en', 'es', 'fr']).default('en'),
  }),
});

// Products collection — each entry is one PHOTO ("shot") shown in
// "Available now". A shot can contain several pieces; each piece gets a
// hotspot (x/y as % of the photo) in the shop-the-photo lightbox.
const pieceStatus = z.enum(['Available', 'One of one', 'Made to order', 'Sold']);
const productCategory = z.enum(['jewelry', 'earrings', 'hats', 'beanies']);

const products = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/products' }),
  schema: ({ image }) =>
    z.object({
      /** Card title (a single piece's name, or a collection name) */
      name: z.string(),
      details: z.string(),
      /** Card price line; omit to show "Ask for pricing" */
      priceRange: z.string().optional(),
      status: pieceStatus,
      /** Shop filter group; defaults to jewelry for the original necklace shots */
      category: productCategory.default('jewelry'),
      image: image(),
      imageAlt: z.string(),
      /** CSS object-position for the card crop, e.g. "8% 48%" */
      imagePosition: z.string().default('50% 50%'),
      order: z.number().default(0),
      featured: z.boolean().default(true),
      /** Pieces visible in the photo, with hotspot positions */
      pieces: z
        .array(
          z.object({
            name: z.string(),
            details: z.string().optional(),
            /** Omit to show "Ask Salem for price" */
            price: z.string().optional(),
            /** Defaults to the shot's status */
            status: pieceStatus.optional(),
            x: z.number().min(0).max(100),
            y: z.number().min(0).max(100),
          })
        )
        .default([]),
    }),
});

export const collections = {
  products,
  blog,
  pages,
  authors,
  faqs,
};
