import { PluginOptions } from '../../index';
import { payloadCrowdinSyncFilesApi } from ".";
import { CrowdinArticleDirectory, CrowdinFile } from '../../payload-types';
import { BlocksField as BlockField, CollectionConfig, Document, GlobalConfig, PayloadRequest, RichTextField } from 'payload';

import { isEmpty } from 'es-toolkit/compat';
import {
  getFile,
  getFiles
} from "../helpers";
import { Descendant } from "slate";
import { buildCrowdinHtmlObject, buildCrowdinJsonObject, findField, reLocalizeField } from '../../utilities';
import { convertLexicalToHtml, convertSlateToHtml } from '../../utilities/richTextConversion'
import { extractLexicalBlockContent, getLexicalBlockFields, getLexicalEditorConfig } from '../../utilities/lexical';
import { filesApiByDocument } from './by-document';
import { CollectionSlug, GlobalSlug } from 'payload';

type FileData = string | object;

interface IupdateOrCreateFile {
  name: string;
  fileData: FileData;
  fileType: "html" | "json";
  sourceBlocks?: unknown[]
}

export class payloadCrowdinSyncDocumentFilesApi extends payloadCrowdinSyncFilesApi {
  document: Document
  articleDirectory: CrowdinArticleDirectory
  collectionSlug: CollectionSlug | "globals";
  global?: boolean;

  constructor({
    document,
    articleDirectory,
    collectionSlug,
    global,
  }: {
    document: Document,
    articleDirectory: CrowdinArticleDirectory,
    collectionSlug:  CollectionSlug | "globals",
    global: boolean,
  }, pluginOptions: PluginOptions, req: PayloadRequest) {
    super(pluginOptions, req);
    this.document = document
    this.articleDirectory = articleDirectory
    this.collectionSlug = collectionSlug
    this.global = global
  }

  /**
   * getFile
   * 
   * Retrieve a CrowdinFile associated with this document by name. 
   * 
   * @param name file name
   * @returns CrowdinFile
   */
  async getFile(name: string): Promise<CrowdinFile> {
    return getFile(name, this.articleDirectory.id, this.req.payload);
  }

  /**
   * getFiles
   * 
   * Retrieve all CrowdinFile types associated with this document. 
   * 
   * @returns CrowdinFile[]
   */
  async getFiles(): Promise<CrowdinFile[]> {
    return getFiles(this.articleDirectory.id, this.req.payload);
  }

  /**
   * Create/Update/Delete a file on Crowdin
   *
   * Records the file in Payload CMS under the `crowdin-files` collection.
   *
   * - Create a file if it doesn't exist on Crowdin and the supplied content is not empty
   * - Update a file if it exists on Crowdin and the supplied content is not empty
   * - Delete a file if it exists on Crowdin and the supplied file content is empty
   */
  async createOrUpdateFile({
    name,
    fileData,
    fileType,
    sourceBlocks,
  }: IupdateOrCreateFile) {
    const empty = isEmpty(fileData);
    // Check whether file exists on Crowdin
    const crowdinFile = await this.getFile(name);
    let updatedCrowdinFile;
    if (!empty) {
      if (!crowdinFile) {
        updatedCrowdinFile = await this.createFile({
          name,
          fileData,
          fileType,
          sourceBlocks,
        });
      } else {
        updatedCrowdinFile = await this.updateFile({
          crowdinFile,
          name: name,
          fileData,
          fileType,
          sourceBlocks,
        });
      }
    } else {
      if (crowdinFile) {
        updatedCrowdinFile = await this.deleteFile(crowdinFile);
      }
    }
    return updatedCrowdinFile;
  }

  private async updateFile({
    crowdinFile,
    name,
    fileData,
    fileType,
    sourceBlocks,
  }: {crowdinFile: CrowdinFile} & IupdateOrCreateFile) {
    if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
      console.log('updateFile', {
        crowdinFile,
        name,
        fileData,
        fileType,
        sourceBlocks,
      })
    }
    // Update file on Crowdin
    const updatedCrowdinFile = await this.crowdinUpdateFile({
      fileId: crowdinFile.originalId as number,
      name,
      fileData,
      fileType,
    });

    await this.req.payload.update({
      collection: "crowdin-files", // required
      id: crowdinFile.id,
      data: {
        // required
        updatedAt: updatedCrowdinFile.data.updatedAt,
        revisionId: updatedCrowdinFile.data.revisionId,
        ...(fileType === "json" && { fileData: { json: (fileData as {
          [k: string]: Partial<unknown>;
        }) }}),
        ...(fileType === "html" && { fileData: { html: typeof fileData === 'string' ? fileData : JSON.stringify(fileData), ...(sourceBlocks && { sourceBlocks: JSON.stringify(sourceBlocks) }) } }),
      },
      req: this.req,
    });
  }

  private async createFile({
    name,
    fileData,
    fileType,
    sourceBlocks,
  }: IupdateOrCreateFile) {
    if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
      console.log('createFile', {
        name,
        fileData,
        fileType,
        sourceBlocks,
      })
    }
    // Create file on Crowdin
    const originalId = this.articleDirectory.originalId
    if (originalId) {
      const crowdinFile = await this.crowdinCreateFile({
        directoryId: originalId,
        name,
        fileData,
        fileType,
      });
      // Store result on Payload CMS
      if (crowdinFile) {
        const payloadCrowdinFile = await this.req.payload.create({
          collection: "crowdin-files", // required
          data: {
            // required
            title: name,
            field: name,
            crowdinArticleDirectory: this.articleDirectory.id,
            reference: {
              createdAt: crowdinFile.data.createdAt,
              updatedAt: crowdinFile.data.updatedAt,
              projectId: crowdinFile.data.projectId,
            },
            originalId: crowdinFile.data.id,
            directoryId: crowdinFile.data.directoryId,
            revisionId: crowdinFile.data.revisionId,
            name: `${name}.${fileType}`,
            type: fileType,
            path: crowdinFile.data.path,
            ...(fileType === "json" && { fileData: { json: (fileData as {
              [k: string]: Partial<unknown>;
            }) } }),
            ...(fileType === "html" && { fileData: { html: typeof fileData === 'string' ? fileData : JSON.stringify(fileData), ...(sourceBlocks && { sourceBlocks: JSON.stringify(sourceBlocks) })} }),
          },
          req: this.req,
        });
        return payloadCrowdinFile;
      }
    }
    return
  }

  async deleteFile(crowdinFile: CrowdinFile) {
    if (process.env.PAYLOAD_CROWDIN_SYNC_VERBOSE) {
      console.log('deleteFile', {
        crowdinFile,
      })
    }
    await this.sourceFilesApi.deleteFile(
      this.projectId,
      crowdinFile.originalId as number
    );
    const payloadFile = await this.req.payload.delete({
      collection: "crowdin-files", // required
      id: crowdinFile.id, // required
      req: this.req,
    });
    return payloadFile;
  }

  async createOrUpdateJsonFile({
    fileData,
    fileName = "fields",
    req,
  }: {
    fileData: FileData,
    fileName?: string,
    req?: PayloadRequest
  }) {
    await this.createOrUpdateFile({
      name: fileName,
      fileData,
      fileType: "json",
    });
  }

  async createOrUpdateHtmlFile({
    name,
    value,
    collection,
  }: {
    name: string;
    value: Descendant[] | any;
    collection: CollectionConfig | GlobalConfig;
  }) {
    // brittle check for Lexical value - improve this detection. Type check? Anything from Payload to indicate the type?
    let blockContent, blockConfig: BlockField | undefined
    const isLexical = Object.prototype.hasOwnProperty.call(value, "root")
    
    if (isLexical) {
      const field = findField({
        dotNotation: name,
        fields: collection.fields,
        filterLocalizedFields: collection.slug === 'mock-collection-for-lexical-blocks' ? false : true,
      }) as RichTextField

      const editorConfig = getLexicalEditorConfig(field)

      if (editorConfig) {
        const html = await convertLexicalToHtml(value, editorConfig)
        // no need to detect change - this has already been done on the field's JSON object
        blockContent = value && extractLexicalBlockContent(value.root)
        blockConfig = editorConfig && getLexicalBlockFields(editorConfig)
        await this.createOrUpdateFile({
          name: name,
          fileData: html,
          fileType: "html",
          ...(!isEmpty(blockContent) && {
            sourceBlocks: blockContent
          }),
        });
        if (blockContent && blockContent.length > 0 && blockConfig) {
          await this.createLexicalBlocks({
            collection,
            blockContent,
            blockConfig,
            name,
            req: this.req,
          })
        }
      } else {
        const html = "<span>lexical configuration not found</span>"
        await this.createOrUpdateFile({
          name: name,
          fileData: html,
          fileType: "html",
        });
      }
    } else {
      const html = convertSlateToHtml(value, this.pluginOptions.slateToHtmlConfig)
      await this.createOrUpdateFile({
        name: name,
        fileData: html,
        fileType: "html",
      });
    }
  }

  async createLexicalBlocks({
    collection,
    blockContent,
    blockConfig,
    name,
    req,
  }: {
    collection: CollectionConfig | GlobalConfig
    blockContent: unknown[]
    blockConfig: BlockField
    name: string
    req: PayloadRequest
  }) {    
    // directory name must be unique from file names - Crowdin API
    const folderName = `${this.pluginOptions.lexicalBlockFolderPrefix}${name}`
    /**
     * Initialize Crowdin client sourceFilesApi
     */
    const apiByDocument = new filesApiByDocument(
      {
        document: {
          // Lexical field name used for documentId
          id: folderName,
          // Friendly name for directory
          title: name,
        },
        collectionSlug: collection.slug as CollectionSlug | GlobalSlug,
        global: false,
        pluginOptions: this.pluginOptions,
        req,
        // Important: Identify that this article directory has a parent - logic changes for non-top-level directories.
        parent: this.articleDirectory,
      },
    );

    const filesApi = await apiByDocument.get()
      const fieldName = `blocks`
      const currentCrowdinJsonData = buildCrowdinJsonObject({
        doc: {
          [fieldName]: blockContent,
        },
        fields: [
          {
            name: fieldName,
            type: 'blocks',
            blocks: blockConfig.blocks,
          }
        ],
        isLocalized: reLocalizeField, // ignore localized attribute
      });
      const currentCrowdinHtmlData = buildCrowdinHtmlObject({
        doc: {
          [fieldName]: blockContent,
        },
        fields: [
          {
            name: fieldName,
            type: 'blocks',
            blocks: blockConfig.blocks,
          }
        ],
        isLocalized: reLocalizeField, // ignore localized attribute
      });

    await filesApi.createOrUpdateJsonFile({
      fileData: currentCrowdinJsonData,
      fileName: fieldName,
      req,
    });
    await Promise.allSettled(Object.keys(currentCrowdinHtmlData).map(async (name) => {
      await filesApi.createOrUpdateHtmlFile({
        name,
        value: currentCrowdinHtmlData[name] as Descendant[],
        collection: {
          slug: 'mock-collection-for-lexical-blocks',
          fields: [
            {
              name: fieldName,
              type: 'blocks',
              blocks: blockConfig ? blockConfig.blocks : [],
            }
          ],
        },
      });
    }));
  }

  async deleteFilesAndDirectory() {
    const files = await this.getFiles();

    for (const file of files) {
      await this.deleteFile(file);
    }

    await this.deleteArticleDirectory(this.document.id);
  }
}
