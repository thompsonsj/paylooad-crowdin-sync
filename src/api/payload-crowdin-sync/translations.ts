import crowdin, { Credentials, Translations } from '@crowdin/crowdin-api-client';
import { payloadCrowdInSyncFilesApi } from './files';
import { mockCrowdinClient } from '../mock/crowdin-client';
import { Payload } from 'payload';
import { PluginOptions } from '../../types';
import deepEqual from 'deep-equal'
import { CollectionConfig, GlobalConfig } from 'payload/types'
import { htmlToSlate, payloadHtmlToSlateConfig } from 'slate-serializers'
import {
  getLocalizedFields,
  getFieldSlugs,
  buildCrowdinJsonObject,
  getLocalizedRequiredFields
} from '../../utilities'

interface IgetLatestDocumentTranslation {
  collection: string
  doc: any
  locale: string
  global?: boolean
}

interface IgetCurrentDocumentTranslation {
  doc: any
  collection: string
  locale: string
  global?: boolean
}

interface IgetTranslation {
  documentId: string
  fieldName: string
  locale: string
  global?: boolean
}

interface IupdateTranslation {
  documentId: string
  collection: string
  dryRun?: boolean
  global? :boolean
}

export class payloadCrowdInSyncTranslationsApi {
  translationsApi: Translations;
  filesApi: payloadCrowdInSyncFilesApi; // our wrapper for file operations
  projectId: number;
  directoryId?: number;
  payload: Payload;
  localeMap: PluginOptions['localeMap'];

  constructor(pluginOptions: PluginOptions, payload: Payload) {
    // credentials
    const credentials: Credentials = {
      token: pluginOptions.token,
    };
    const {
      translationsApi
    } = new crowdin(credentials);
    this.projectId = pluginOptions.projectId;
    this.directoryId = pluginOptions.directoryId;
    this.translationsApi = process.env.NODE_ENV === 'test' ? mockCrowdinClient(pluginOptions) as any : translationsApi;
    this.filesApi = new payloadCrowdInSyncFilesApi(pluginOptions, payload);
    this.payload = payload;
    this.localeMap = pluginOptions.localeMap;
  }

  async updateTranslation({
    documentId,
    collection,
    dryRun = true,
    global = false,
  }: IupdateTranslation) {
    /**
     * Get existing document
     * 
     * * check document exists
     * * check for `meta` field (which can be added by @payloadcms/seo) 
     * 
     */
    let doc
    if (global) {
      doc = await this.payload.findGlobal({
        slug: collection,
        locale: "en"
      })
    } else {
      doc = await this.payload.findByID({
        collection: collection,
        id: documentId,
        locale: "en"
      })
    }
    const report: {[key: string]: any} = {}
    for (const locale of Object.keys(this.localeMap)) {
      report[locale] = {}
      report[locale].currentTranslations = await this.getCurrentDocumentTranslation({
        doc: doc,
        collection: collection,
        locale: locale,
        global
      })
      report[locale].latestTranslations = await this.getLatestDocumentTranslation({
        collection: collection,
        doc: doc,
        locale: locale,
        global,
      })
      report[locale].changed = !deepEqual(report[locale].currentTranslations, report[locale].latestTranslations)
      if (report[locale].changed && !dryRun) {
        if (global) {
          await this.payload.updateGlobal({
            slug: collection,
            locale: locale,
            data: {
              ...report[locale].latestTranslations,
              // error on update without the following line.
              // see https://github.com/thompsonsj/payload-crowdin-sync/pull/13/files#r1209271660
              crowdinArticleDirectory: doc.crowdinArticleDirectory.id,
            },
          })
        } else {
          await this.payload.update({
            collection: collection,
            locale: locale,
            id: documentId,
            data: report[locale].latestTranslations,
          })
        }
      }
    }
    return {
      source: doc,
      translations: { ...report }
    }
  }
  
  async getCurrentDocumentTranslation({
    doc,
    collection,
    locale,
    global = false,
  }: IgetCurrentDocumentTranslation) {
    let document: any
    if (global) {
      document = await this.payload.findGlobal({
        slug: collection,
        locale: locale
      })
    } else {
      document = await this.payload.findByID({
        collection: collection,
        id: doc.id,
        locale: locale
      })
    }

    let collectionConfig
    if (global) {
      collectionConfig = this.payload.config.globals.find((col: GlobalConfig) => col.slug === collection)
    } else {
      collectionConfig = this.payload.config.collections.find((col: CollectionConfig) => col.slug === collection)
    }
    if (!collectionConfig) throw new Error(`Collection ${collection} not found in payload config`)

    const localizedFields = getLocalizedFields({fields: collectionConfig.fields})
    // does not support nested html fields yet
    const htmlFields: {[key: string]: any} = {}
    getLocalizedFields({fields: collectionConfig.fields, type: 'html'}).forEach(field => (
      htmlFields[field.name] = document[field.name]
    ))
    return {
      ...buildCrowdinJsonObject({
        doc: document,
        fields: localizedFields
      }),
      ...htmlFields
    }
  }
  
  /**
   * Retrieve translations from CrowdIn for a document in a given locale
   */
  async getLatestDocumentTranslation({
    collection,
    doc,
    locale,
    global = false,
  }: IgetLatestDocumentTranslation) {
    let collectionConfig: any
    if (global) {
      collectionConfig = this.payload.config.globals.find((col: GlobalConfig) => col.slug === collection)
    } else {
      collectionConfig = this.payload.config.collections.find((col: CollectionConfig) => col.slug === collection)
    }
    const localizedFields = getLocalizedFields({ fields: collectionConfig.fields })
    const localizedJsonFields = getFieldSlugs(getLocalizedFields({fields: collectionConfig.fields, type: 'json'}))
    const localizedHtmlFields = getFieldSlugs(getLocalizedFields({fields: collectionConfig.fields, type: 'html'}))
    if (!localizedFields) {
      return {message: "no localized fields"}
    }
    // Support @payloadcms/seo
    if (doc.meta?.title) {
      localizedJsonFields.push('meta.title')
    }
    if (doc.meta?.description) {
      localizedJsonFields.push('meta.description')
    }
  
    let docTranslations: { [key: string]: any } = {}
    // add json fields
    docTranslations = await this.getTranslation({
      documentId: global ? collectionConfig.slug : doc.id,
      fieldName: 'fields',
      locale: locale,
    }) || {}
    // add html fields
    for (const field of localizedHtmlFields) {
      docTranslations[field] = await this.getTranslation({
        documentId: global ? collectionConfig.slug : doc.id,
        fieldName: field,
        locale: locale,
      })
    }
    // Add required fields if not present
    const requiredFieldSlugs = getFieldSlugs(getLocalizedRequiredFields(collectionConfig))
    if (requiredFieldSlugs.length > 0) {
      const currentTranslations = await this.getCurrentDocumentTranslation({
        doc: doc,
        collection: collection,
        locale: locale,
        global,
      })
      requiredFieldSlugs.forEach(slug => {
        if (!docTranslations.hasOwnProperty(slug)) {
          docTranslations[slug] = currentTranslations[slug]
        }
      })
    }
    return docTranslations
  }

  /**
   * Retrieve translations for a document field name
   * 
   * * returns Slate object for html fields
   * * returns all json fields if fieldName is 'fields'
   */
  async getTranslation({
    documentId,
    fieldName,
    locale,
  }: IgetTranslation) {
    const articleDirectory = await this.filesApi.getArticleDirectory(documentId)
    const file = await this.filesApi.getFile(fieldName, articleDirectory.id)
    // it is possible a file doesn't exist yet - e.g. an article with localized text fields that contains an empty html field.
    if (!file) {
      return
    }
    const response = await this.translationsApi.buildProjectFileTranslation(
      this.projectId,
      file.originalId,
      {
        targetLanguageId: this.localeMap[locale].crowdinId
      }
    )
    const data = await this.getFileDataFromUrl(response.data.url)
    return (file.type === 'html') ? htmlToSlate(data, payloadHtmlToSlateConfig) : JSON.parse(data)
  }

  private async getFileDataFromUrl(url: string) {
    const response = await fetch(url)
    const body = await response.text()
    return body
  }
}