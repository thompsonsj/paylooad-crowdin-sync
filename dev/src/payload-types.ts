/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
  collections: {
    categories: Category;
    "localized-posts": LocalizedPost;
    "nested-field-collection": NestedFieldCollection;
    posts: Post;
    tags: Tag;
    users: User;
    "crowdin-files": CrowdinFile;
    "crowdin-collection-directories": CrowdinCollectionDirectory;
    "crowdin-article-directories": CrowdinArticleDirectory;
  };
  globals: {};
}
export interface Category {
  id: string;
  name?: string;
}
export interface LocalizedPost {
  id: string;
  title?: string;
  author?: string | User;
  publishedDate?: string;
  category?: string | Category;
  tags?: string[] | Tag[];
  content?: {
    [k: string]: unknown;
  }[];
  status?: "draft" | "published";
  crowdinArticleDirectory?: string | CrowdinArticleDirectory;
  updatedAt: string;
  createdAt: string;
}
export interface User {
  id: string;
  name?: string;
  updatedAt: string;
  createdAt: string;
  email: string;
  resetPasswordToken?: string;
  resetPasswordExpiration?: string;
  salt?: string;
  hash?: string;
  loginAttempts?: number;
  lockUntil?: string;
  password?: string;
}
export interface Tag {
  id: string;
  name?: string;
}
export interface CrowdinArticleDirectory {
  id: string;
  name?: string;
  crowdinCollectionDirectory?: string | CrowdinCollectionDirectory;
  crowdinFiles?: string[] | CrowdinFile[];
  createdAt: string;
  updatedAt: string;
  originalId?: number;
  projectId?: number;
  directoryId?: number;
}
export interface CrowdinCollectionDirectory {
  id: string;
  name?: string;
  title?: string;
  collectionSlug?: string;
  createdAt: string;
  updatedAt: string;
  originalId?: number;
  projectId?: number;
  directoryId?: number;
}
export interface CrowdinFile {
  id: string;
  title?: string;
  field?: string;
  crowdinArticleDirectory?: string | CrowdinArticleDirectory;
  createdAt: string;
  updatedAt: string;
  originalId?: number;
  projectId?: number;
  directoryId?: number;
  revisionId?: number;
  name?: string;
  type?: string;
  path?: string;
}
export interface NestedFieldCollection {
  id: string;
  title?: string;
  content?: {
    [k: string]: unknown;
  }[];
  metaDescription?: string;
  arrayField?: {
    title?: string;
    content?: {
      [k: string]: unknown;
    }[];
    metaDescription?: string;
    id?: string;
  }[];
  layout?: {
    title?: string;
    content?: {
      [k: string]: unknown;
    }[];
    metaDescription?: string;
    id?: string;
    blockName?: string;
    blockType: "Block";
  }[];
  group?: {
    title?: string;
    content?: {
      [k: string]: unknown;
    }[];
    metaDescription?: string;
  };
  tabOneTitle?: string;
  tabOneContent?: {
    [k: string]: unknown;
  }[];
  tabTwo: {
    title?: string;
    content?: {
      [k: string]: unknown;
    }[];
    metaDescription?: string;
  };
  crowdinArticleDirectory?: string | CrowdinArticleDirectory;
  updatedAt: string;
  createdAt: string;
}
export interface Post {
  id: string;
  title?: string;
  author?: string | User;
  publishedDate?: string;
  category?: string | Category;
  tags?: string[] | Tag[];
  content?: {
    [k: string]: unknown;
  }[];
  status?: "draft" | "published";
  updatedAt: string;
  createdAt: string;
}
