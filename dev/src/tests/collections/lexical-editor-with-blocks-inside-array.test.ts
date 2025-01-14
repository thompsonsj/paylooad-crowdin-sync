import { extractLexicalBlockContent, payloadCrowdinSyncTranslationsApi, utilities, mockCrowdinClient,
  getFilesByDocumentID,
  getFiles,
  getLexicalFieldArticleDirectory,
 } from 'payload-crowdin-sync';
import NestedFieldCollection from '../../collections/NestedFieldCollection';
import { fixture } from './lexical-editor-with-blocks-inside-array.fixture';
import nock from 'nock';

import { pluginConfig } from '../helpers/plugin-config';
import {
  CrowdinArticleDirectory,
  NestedFieldCollection as NestedFieldCollectionType,
} from '../../payload-types';

export const isNotString = <T>(val: T | string | undefined | null): val is T => {
  return val !== undefined && val !== null && typeof val !== 'string';
};

const getRelationshipId = (relationship?: string | CrowdinArticleDirectory | null) => {
  if (!relationship) {
    return undefined
  }
  if (isNotString(relationship)) {
    return relationship.id
  }
  return relationship
}

import { initPayloadInt } from '../helpers/initPayloadInt'
import type { Payload } from 'payload'

let payload: Payload

const pluginOptions = pluginConfig();
const mockClient = mockCrowdinClient(pluginOptions);

describe('Lexical editor with multiple blocks', () => {
  beforeAll(async () => {
    const initialized = await initPayloadInt()
    ;({ payload } = initialized as {
      payload: Payload
    })
  });

  afterEach((done) => {
    if (!nock.isDone()) {
      throw new Error(
        `Not all nock interceptors were used: ${JSON.stringify(
          nock.pendingMocks()
        )}`
      );
    }
    nock.cleanAll();
    done();
  });

  afterAll(async () => {
    if (typeof payload.db.destroy === 'function') {
      await payload.db.destroy()
    }
  });

  it('builds a Crowdin HTML object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(3)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(5)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(5)
      .reply(200, mockClient.createFile({}));

    const doc: NestedFieldCollectionType = (await payload.create({
      collection: 'nested-field-collection',
      data: fixture,
    })) as any;

    const arrayIds =
      (doc.items || []).map((item) => item.id) || ([] as string[]);
    const blockIds =
      (doc.items || []).map(
        (item) => (item.block || []).find((x) => x !== undefined)?.id
      ) || ([] as string[]);

    expect(
      utilities.buildCrowdinHtmlObject({
        doc,
        fields: NestedFieldCollection.fields,
      })
    ).toEqual({
      [`items.${arrayIds[0]}.block.${blockIds[0]}.basicBlockLexical.content`]: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'Lexical fields nested within complex layouts - such as this one (a ',
                  type: 'text',
                  version: 1,
                },
                {
                  detail: 0,
                  format: 16,
                  mode: 'normal',
                  style: '',
                  text: 'blocks',
                  type: 'text',
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: ' field in an ',
                  type: 'text',
                  version: 1,
                },
                {
                  detail: 0,
                  format: 16,
                  mode: 'normal',
                  style: '',
                  text: 'array',
                  type: 'text',
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: ' item within a ',
                  type: 'text',
                  version: 1,
                },
                {
                  detail: 0,
                  format: 16,
                  mode: 'normal',
                  style: '',
                  text: 'tab',
                  type: 'text',
                  version: 1,
                },
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: '), are supported.',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
      [`items.${arrayIds[1]}.block.${blockIds[1]}.basicBlockLexical.content`]: {
        root: {
          children: [
            {
              children: [
                {
                  detail: 0,
                  format: 0,
                  mode: 'normal',
                  style: '',
                  text: 'If you add custom blocks, these will also be translated!',
                  type: 'text',
                  version: 1,
                },
              ],
              direction: 'ltr',
              format: '',
              indent: 0,
              type: 'paragraph',
              version: 1,
            },
            {
              fields: {
                blockName: '',
                blockType: 'highlight',
                color: "yellow",
                content: {
                  root: {
                    children: [
                      {
                        children: [
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: 'Note a key difference with regular blocks - all ',
                            type: 'text',
                            version: 1,
                          },
                          {
                            detail: 0,
                            format: 16,
                            mode: 'normal',
                            style: '',
                            text: 'text',
                            type: 'text',
                            version: 1,
                          },
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: ', ',
                            type: 'text',
                            version: 1,
                          },
                          {
                            detail: 0,
                            format: 16,
                            mode: 'normal',
                            style: '',
                            text: 'textarea',
                            type: 'text',
                            version: 1,
                          },
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: ' and ',
                            type: 'text',
                            version: 1,
                          },
                          {
                            detail: 0,
                            format: 16,
                            mode: 'normal',
                            style: '',
                            text: 'richText',
                            type: 'text',
                            version: 1,
                          },
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: ' fields will be sent to Crowdin regardless of whether or not they are ',
                            type: 'text',
                            version: 1,
                          },
                          {
                            children: [
                              {
                                detail: 0,
                                format: 0,
                                mode: 'normal',
                                style: '',
                                text: 'localized fields',
                                type: 'text',
                                version: 1,
                              },
                            ],
                            direction: 'ltr',
                            fields: {
                              linkType: 'custom',
                              newTab: false,
                              url: 'https://payloadcms.com/docs/configuration/localization#field-by-field-localization',
                            },
                            format: '',
                            indent: 0,
                            type: 'link',
                            version: 2,
                          },
                          {
                            detail: 0,
                            format: 0,
                            mode: 'normal',
                            style: '',
                            text: '.',
                            type: 'text',
                            version: 1,
                          },
                        ],
                        direction: 'ltr',
                        format: '',
                        indent: 0,
                        type: 'paragraph',
                        version: 1,
                      },
                    ],
                    direction: 'ltr',
                    format: '',
                    indent: 0,
                    type: 'root',
                    version: 1,
                  },
                },
                heading: {
                  title: 'Block configuration in Lexical fields',
                },
                id: '6712ec66a81e050bf5f31b43',
              },
              format: '',
              type: 'block',
              version: 2,
            },
          ],
          direction: 'ltr',
          format: '',
          indent: 0,
          type: 'root',
          version: 1,
        },
      },
    });
  });

  it('builds a Crowdin JSON object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(2)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(5)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(5)
      .reply(200, mockClient.createFile({}));

    const doc: NestedFieldCollectionType = (await payload.create({
      collection: 'nested-field-collection',
      data: fixture,
    })) as any;
    const ids = (doc.items || []).map((item) => item.id) || ([] as string[]);

    expect(
      utilities.buildCrowdinJsonObject({
        doc,
        fields: NestedFieldCollection.fields,
      })
    ).toEqual({
      items: {
        [`${ids[0]}`]: {
          heading: 'Nested Lexical fields are supported',
        },
        [`${ids[1]}`]: {
          heading:
            'Nested Lexical fields are supported - and blocks in that Lexical field are also translated',
        },
      },
    });
  });

  it('builds a Payload update object as expected', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .twice()
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(5)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(5)
      .reply(200, mockClient.createFile({}));

    const doc: NestedFieldCollectionType = (await payload.create({
      collection: 'nested-field-collection',
      data: fixture,
    })) as any;

    const arrayIds =
      (doc.items || []).map((item) => item.id) || ([] as string[]);
    const blockIds =
      (doc.items || []).map(
        (item) => (item.block || []).find((x) => x !== undefined)?.id
      ) || ([] as string[]);
    const firstLexicalBlock = doc.items?.[1]?.block?.[0]?.content;

    const lexicalBlockIds = firstLexicalBlock
      ? extractLexicalBlockContent(firstLexicalBlock.root).map(
          (block) => block.id
        )
      : ['lexical-block-id-not-found'];

    const crowdinHtmlObject = utilities.buildCrowdinHtmlObject({
      doc,
      fields: NestedFieldCollection.fields,
    });
    const crowdinJsonObject = utilities.buildCrowdinJsonObject({
      doc,
      fields: NestedFieldCollection.fields,
    });
    expect(
      utilities.buildPayloadUpdateObject({
        crowdinJsonObject,
        crowdinHtmlObject,
        fields: NestedFieldCollection.fields,
        document: doc,
      })
    ).toEqual({
      items: [
        {
          block: [
            {
              blockType: 'basicBlockLexical',
              content: {
                root: {
                  children: [
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: 'Lexical fields nested within complex layouts - such as this one (a ',
                          type: 'text',
                          version: 1,
                        },
                        {
                          detail: 0,
                          format: 16,
                          mode: 'normal',
                          style: '',
                          text: 'blocks',
                          type: 'text',
                          version: 1,
                        },
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: ' field in an ',
                          type: 'text',
                          version: 1,
                        },
                        {
                          detail: 0,
                          format: 16,
                          mode: 'normal',
                          style: '',
                          text: 'array',
                          type: 'text',
                          version: 1,
                        },
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: ' item within a ',
                          type: 'text',
                          version: 1,
                        },
                        {
                          detail: 0,
                          format: 16,
                          mode: 'normal',
                          style: '',
                          text: 'tab',
                          type: 'text',
                          version: 1,
                        },
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: '), are supported.',
                          type: 'text',
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      type: 'paragraph',
                      version: 1,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'root',
                  version: 1,
                },
              },
              id: `${blockIds[0]}`,
            },
          ],
          heading: 'Nested Lexical fields are supported',
          id: `${arrayIds[0]}`,
        },
        {
          block: [
            {
              blockType: 'basicBlockLexical',
              content: {
                root: {
                  children: [
                    {
                      children: [
                        {
                          detail: 0,
                          format: 0,
                          mode: 'normal',
                          style: '',
                          text: 'If you add custom blocks, these will also be translated!',
                          type: 'text',
                          version: 1,
                        },
                      ],
                      direction: 'ltr',
                      format: '',
                      indent: 0,
                      type: 'paragraph',
                      version: 1,
                    },
                    {
                      fields: {
                        blockName: '',
                        blockType: 'highlight',
                        color: "yellow",
                        content: {
                          root: {
                            children: [
                              {
                                children: [
                                  {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: 'Note a key difference with regular blocks - all ',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    detail: 0,
                                    format: 16,
                                    mode: 'normal',
                                    style: '',
                                    text: 'text',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: ', ',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    detail: 0,
                                    format: 16,
                                    mode: 'normal',
                                    style: '',
                                    text: 'textarea',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: ' and ',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    detail: 0,
                                    format: 16,
                                    mode: 'normal',
                                    style: '',
                                    text: 'richText',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: ' fields will be sent to Crowdin regardless of whether or not they are ',
                                    type: 'text',
                                    version: 1,
                                  },
                                  {
                                    children: [
                                      {
                                        detail: 0,
                                        format: 0,
                                        mode: 'normal',
                                        style: '',
                                        text: 'localized fields',
                                        type: 'text',
                                        version: 1,
                                      },
                                    ],
                                    direction: 'ltr',
                                    fields: {
                                      linkType: 'custom',
                                      newTab: false,
                                      url: 'https://payloadcms.com/docs/configuration/localization#field-by-field-localization',
                                    },
                                    format: '',
                                    indent: 0,
                                    type: 'link',
                                    version: 2,
                                  },
                                  {
                                    detail: 0,
                                    format: 0,
                                    mode: 'normal',
                                    style: '',
                                    text: '.',
                                    type: 'text',
                                    version: 1,
                                  },
                                ],
                                direction: 'ltr',
                                format: '',
                                indent: 0,
                                type: 'paragraph',
                                version: 1,
                              },
                            ],
                            direction: 'ltr',
                            format: '',
                            indent: 0,
                            type: 'root',
                            version: 1,
                          },
                        },
                        heading: {
                          title: 'Block configuration in Lexical fields',
                        },
                        id: `${lexicalBlockIds[0]}`,
                      },
                      format: '',
                      type: 'block',
                      version: 2,
                    },
                  ],
                  direction: 'ltr',
                  format: '',
                  indent: 0,
                  type: 'root',
                  version: 1,
                },
              },
              id: `${blockIds[1]}`,
            },
          ],
          heading:
            'Nested Lexical fields are supported - and blocks in that Lexical field are also translated',
          id: `${arrayIds[1]}`,
        },
      ],
    });
  });

  it('creates files for rich text files with expected data', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(2)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(5)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(5)
      .reply(200, mockClient.createFile({}));

    const create = await payload.create({
      collection: 'nested-field-collection',
      data: fixture,
    });
    // update now that a Crowdin article directory is available
    const doc: NestedFieldCollectionType = (await payload.update({
      id: create.id,
      collection: 'nested-field-collection',
      data: {
        title: 'Test nested field collection',
      },
    })) as any;

    const arrayIds =
      (doc.items || []).map((item) => item.id) || ([] as string[]);
    const firstLexicalBlock = doc.items?.[1]?.block?.[0]?.content;

    const lexicalBlockIds = firstLexicalBlock
      ? extractLexicalBlockContent(firstLexicalBlock.root).map(
          (block) => block.id
        )
      : ['lexical-block-id-not-found'];

    const files = await getFilesByDocumentID({documentId: `${doc.id}`, payload});

    expect(files.length).toEqual(3);

    expect(files[0].fileData).toEqual({
      html: `<p>If you add custom blocks, these will also be translated!</p><span data-block-id=${lexicalBlockIds[0]} data-block-type=highlight></span>`,
      sourceBlocks: JSON.stringify([
        {
            "id": `${lexicalBlockIds[0]}`,
            "blockName": "",
            "blockType": "highlight",
            "content": {
                "root": {
                    "children": [
                        {
                            "children": [
                                {
                                    "detail": 0,
                                    "format": 0,
                                    "mode": "normal",
                                    "style": "",
                                    "text": "Note a key difference with regular blocks - all ",
                                    "type": "text",
                                    "version": 1
                                },
                                {
                                    "detail": 0,
                                    "format": 16,
                                    "mode": "normal",
                                    "style": "",
                                    "text": "text",
                                    "type": "text",
                                    "version": 1
                                },
                                {
                                    "detail": 0,
                                    "format": 0,
                                    "mode": "normal",
                                    "style": "",
                                    "text": ", ",
                                    "type": "text",
                                    "version": 1
                                },
                                {
                                    "detail": 0,
                                    "format": 16,
                                    "mode": "normal",
                                    "style": "",
                                    "text": "textarea",
                                    "type": "text",
                                    "version": 1
                                },
                                {
                                    "detail": 0,
                                    "format": 0,
                                    "mode": "normal",
                                    "style": "",
                                    "text": " and ",
                                    "type": "text",
                                    "version": 1
                                },
                                {
                                    "detail": 0,
                                    "format": 16,
                                    "mode": "normal",
                                    "style": "",
                                    "text": "richText",
                                    "type": "text",
                                    "version": 1
                                },
                                {
                                    "detail": 0,
                                    "format": 0,
                                    "mode": "normal",
                                    "style": "",
                                    "text": " fields will be sent to Crowdin regardless of whether or not they are ",
                                    "type": "text",
                                    "version": 1
                                },
                                {
                                    "children": [
                                        {
                                            "detail": 0,
                                            "format": 0,
                                            "mode": "normal",
                                            "style": "",
                                            "text": "localized fields",
                                            "type": "text",
                                            "version": 1
                                        }
                                    ],
                                    "direction": "ltr",
                                    "format": "",
                                    "indent": 0,
                                    "type": "link",
                                    "version": 2,
                                    "fields": {
                                        "linkType": "custom",
                                        "newTab": false,
                                        "url": "https://payloadcms.com/docs/configuration/localization#field-by-field-localization"
                                    }
                                },
                                {
                                    "detail": 0,
                                    "format": 0,
                                    "mode": "normal",
                                    "style": "",
                                    "text": ".",
                                    "type": "text",
                                    "version": 1
                                }
                            ],
                            "direction": "ltr",
                            "format": "",
                            "indent": 0,
                            "type": "paragraph",
                            "version": 1
                        }
                    ],
                    "direction": "ltr",
                    "format": "",
                    "indent": 0,
                    "type": "root",
                    "version": 1
                }
            },
            "heading": {
                "title": "Block configuration in Lexical fields"
            },
            "color": "yellow"
        }
    ])});
    expect(files[1].fileData).toMatchInlineSnapshot(`
      {
        "html": "<p>Lexical fields nested within complex layouts - such as this one (a <code>blocks</code> field in an <code>array</code> item within a <code>tab</code>), are supported.</p>",
      }
    `);
    expect(files[2].fileData).toEqual({
      json: {
        items: {
          [`${arrayIds[0]}`]: {
            heading: 'Nested Lexical fields are supported',
          },
          [`${arrayIds[1]}`]: {
            heading:
              'Nested Lexical fields are supported - and blocks in that Lexical field are also translated',
          },
        },
      },
    });
  });

  it('creates files for Lexical block with expected data', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .times(2)
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(5)
      .reply(200, mockClient.addStorage())
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .times(5)
      .reply(200, mockClient.createFile({}));

    const create = await payload.create({
      collection: 'nested-field-collection',
      data: fixture,
    });
    // update now that a Crowdin article directory is available
    const doc: NestedFieldCollectionType = (await payload.update({
      id: create.id,
      collection: 'nested-field-collection',
      data: {
        title: 'Test nested field collection',
      },
    })) as any;

    const arrayIds =
      (doc.items || []).map((item) => item.id) || ([] as string[]);
    const blockIds =
      (doc.items || []).map(
        (item) => (item.block || []).find((x) => x !== undefined)?.id
      ) || ([] as string[]);

    const lexicalFieldCrowdinArticleDirectory = await getLexicalFieldArticleDirectory({
      payload,
      parent: doc.crowdinArticleDirectory,
      name: `lex.items.${arrayIds[1]}.block.${blockIds[1]}.basicBlockLexical.content`
    })

    const files = await getFiles(
      `${getRelationshipId(lexicalFieldCrowdinArticleDirectory)}`,
      payload
    );

    expect(files.length).toEqual(2);

    expect(
      (files[0]?.crowdinArticleDirectory as CrowdinArticleDirectory)?.parent
    ).toBeDefined();
    expect(files[0].fileData).toMatchInlineSnapshot(`
      {
        "html": "<p>Note a key difference with regular blocks - all <code>text</code>, <code>textarea</code> and <code>richText</code> fields will be sent to Crowdin regardless of whether or not they are <a href="https://payloadcms.com/docs/configuration/localization#field-by-field-localization">localized fields</a>.</p>",
      }
    `);
    expect(
      (files[1]?.crowdinArticleDirectory as CrowdinArticleDirectory)?.parent
    ).toBeDefined();
    expect(files[1].fileData).toMatchInlineSnapshot(`
      {
        "json": {
          "blocks": {
            "6712ec66a81e050bf5f31b43": {
              "highlight": {
                "heading": {
                  "title": "Block configuration in Lexical fields",
                },
              },
            },
          },
        },
      }
    `);
  });

  it('updates the Payload document with a translation from Crowdin', async () => {
    nock('https://api.crowdin.com')
      .post(`/api/v2/projects/${pluginOptions.projectId}/directories`)
      .twice()
      .reply(200, mockClient.createDirectory({}))
      .post(`/api/v2/storages`)
      .times(5)
      .reply(200, mockClient.addStorage())
      // file 1 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 48311,
        })
      )
      // file 2 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 48312,
        })
      )
      // file 3 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 48313,
        })
      )
      // file 4 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 48314,
        })
      )
      // file 5 creation
      .post(`/api/v2/projects/${pluginOptions.projectId}/files`)
      .reply(
        200,
        mockClient.createFile({
          fileId: 48315,
        })
      );

    const doc: NestedFieldCollectionType = (await payload.create({
      collection: 'nested-field-collection',
      data: fixture,
    })) as any;

    const updatedDoc = (await payload.update({
      id: doc.id,
      collection: 'nested-field-collection',
      data: {
        title: 'Update required to access the crowdinArticleDirectory?',
      },
    })) as any;

    const arrayIds =
      (doc.items || []).map((item) => item.id) || ([] as string[]);
    const blockIds =
      (doc.items || []).map(
        (item) => (item.block || []).find((x) => x !== undefined)?.id
      ) || ([] as string[]);
    const firstLexicalBlock = doc.items?.[1]?.block?.[0]?.content;

    const lexicalBlockIds = firstLexicalBlock
      ? extractLexicalBlockContent(firstLexicalBlock.root).map(
          (block) => block.id
        )
      : ['lexical-block-id-not-found'];

    // fr - file 1 get translation
    nock('https://api.crowdin.com')
      .post(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/files/${48311}`,
        {
          targetLanguageId: 'fr',
        }
      )
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${48311}/download?targetLanguageId=fr`,
        })
      )
      .get(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/${48311}/download`
      )
      .query({
        targetLanguageId: 'fr',
      })
      .reply(200, {
        items: {
          [`${arrayIds[0]}`]: {
            heading: 'Les champs lexicaux imbriqués sont pris en charge',
          },
          [`${arrayIds[1]}`]: {
            heading:
              'Les champs lexicaux imbriqués sont pris en charge - et les blocs de ce champ lexical sont également traduits',
          },
        },
      })
      // fr - file 2 get translation
      .post(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/files/${48312}`,
        {
          targetLanguageId: 'fr',
        }
      )
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${48312}/download?targetLanguageId=fr`,
        })
      )
      .get(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/${48312}/download`
      )
      .query({
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        '<p>Les champs lexicaux imbriqués dans des mises en page complexes - comme celui-ci (un champ <code>blocks</code> dans un élément <code>array</code> dans un <code>onglet</code>), sont pris en charge.</p>'
      )
      // fr - file 3 get translation
      .post(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/files/${48313}`,
        {
          targetLanguageId: 'fr',
        }
      )
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${48313}/download?targetLanguageId=fr`,
        })
      )
      .get(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/${48313}/download`
      )
      .query({
        targetLanguageId: 'fr',
      })
      .reply(200, {
        blocks: {
          [`${lexicalBlockIds[0]}`]: {
            highlight: {
              heading: {
                title: 'Configuration des blocs dans les champs lexicaux',
              },
            },
          },
        },
      })
      // fr - file 4 get translation
      .post(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/files/${48314}`,
        {
          targetLanguageId: 'fr',
        }
      )
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${48314}/download?targetLanguageId=fr`,
        })
      )
      .get(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/${48314}/download`
      )
      .query({
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        `<p>Notez une différence clé avec les blocs normaux : tous les champs <code>text</code>, <code>textarea</code> et <code>richText</code> seront envoyés à Crowdin, qu'ils soient ou non <a href="https://payloadcms.com/docs/configuration/localization#field-by-field-localization">champs localisés</a>.</p>`
      )
      // fr - file 5 get translation
      .post(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/files/${48315}`,
        {
          targetLanguageId: 'fr',
        }
      )
      .reply(
        200,
        mockClient.buildProjectFileTranslation({
          url: `https://api.crowdin.com/api/v2/projects/${
            pluginOptions.projectId
          }/translations/builds/${48315}/download?targetLanguageId=fr`,
        })
      )
      .get(
        `/api/v2/projects/${
          pluginOptions.projectId
        }/translations/builds/${48315}/download`
      )
      .query({
        targetLanguageId: 'fr',
      })
      .reply(
        200,
        `<p>Si vous ajoutez des blocs personnalisés, ceux-ci seront également traduits !</p><span data-block-id=${lexicalBlockIds[0]} data-block-type=highlight></span>`
      );

    const crowdinFiles = await getFilesByDocumentID({documentId: `${doc.id}`, payload});
    const lexicalFieldCrowdinArticleDirectory = await getLexicalFieldArticleDirectory({
      payload,
      parent: updatedDoc.crowdinArticleDirectory,
      name: `lex.items.${arrayIds[1]}.block.${blockIds[1]}.basicBlockLexical.content`
    })
    const contentCrowdinFiles = await getFiles(
      `${getRelationshipId(lexicalFieldCrowdinArticleDirectory)}`,
      payload 
    );

    // check file ids are always mapped in the same way
    const fileIds = crowdinFiles.map((file) => ({
      fileId: file.originalId,
      field: file.field,
    }));
    const contentFileIds = contentCrowdinFiles.map((file) => ({
      fileId: file.originalId,
      field: file.field,
    }));
    expect(fileIds).toEqual([
      {
        field: `items.${arrayIds[1]}.block.${blockIds[1]}.basicBlockLexical.content`,
        fileId: 48313,
      },
      {
        field: `items.${arrayIds[0]}.block.${blockIds[0]}.basicBlockLexical.content`,
        fileId: 48312,
      },
      {
        field: 'fields',
        fileId: 48311,
      },
    ]);
    expect(contentFileIds).toEqual([
      {
        field: `blocks.${lexicalBlockIds[0]}.highlight.content`,
        fileId: 48315,
      },
      {
        field: 'blocks',
        fileId: 48314,
      },
    ]);
    const translationsApi = new payloadCrowdinSyncTranslationsApi(
      pluginOptions,
      payload
    );
    await translationsApi.updateTranslation({
      documentId: `${doc.id}`,
      collection: 'nested-field-collection',
      dryRun: false,
      excludeLocales: ['de_DE'],
    });
    // retrieve translated post from Payload
    const result = await payload.findByID({
      collection: 'nested-field-collection',
      id: `${doc.id}`,
      locale: 'fr_FR',
    });
    expect(result['items']).toEqual(
      [
        {
          "block": [
            {
              "blockType": "basicBlockLexical",
              "content": {
                "root": {
                  "children": [
                    {
                      "children": [
                        {
                          "detail": 0,
                          "format": 0,
                          "mode": "normal",
                          "style": "",
                          "text": "Les champs lexicaux imbriqués dans des mises en page complexes - comme celui-ci (un champ ",
                          "type": "text",
                          "version": 1,
                        },
                        {
                          "detail": 0,
                          "format": 16,
                          "mode": "normal",
                          "style": "",
                          "text": "blocks",
                          "type": "text",
                          "version": 1,
                        },
                        {
                          "detail": 0,
                          "format": 0,
                          "mode": "normal",
                          "style": "",
                          "text": " dans un élément ",
                          "type": "text",
                          "version": 1,
                        },
                        {
                          "detail": 0,
                          "format": 16,
                          "mode": "normal",
                          "style": "",
                          "text": "array",
                          "type": "text",
                          "version": 1,
                        },
                        {
                          "detail": 0,
                          "format": 0,
                          "mode": "normal",
                          "style": "",
                          "text": " dans un ",
                          "type": "text",
                          "version": 1,
                        },
                        {
                          "detail": 0,
                          "format": 16,
                          "mode": "normal",
                          "style": "",
                          "text": "onglet",
                          "type": "text",
                          "version": 1,
                        },
                        {
                          "detail": 0,
                          "format": 0,
                          "mode": "normal",
                          "style": "",
                          "text": "), sont pris en charge.",
                          "type": "text",
                          "version": 1,
                        },
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "textFormat": 0,
                      "textStyle": "",
                      "type": "paragraph",
                      "version": 1,
                    },
                  ],
                  "direction": "ltr",
                  "format": "",
                  "indent": 0,
                  "type": "root",
                  "version": 1,
                },
              },
              "id": `${blockIds[0]}`,
            },
          ],
          "heading": "Les champs lexicaux imbriqués sont pris en charge",
          "id": `${arrayIds[0]}`,
        },
        {
          "block": [
            {
              "blockType": "basicBlockLexical",
              "content": {
                "root": {
                  "children": [
                    {
                      "children": [
                        {
                          "detail": 0,
                          "format": 0,
                          "mode": "normal",
                          "style": "",
                          "text": "Si vous ajoutez des blocs personnalisés, ceux-ci seront également traduits !",
                          "type": "text",
                          "version": 1,
                        },
                      ],
                      "direction": "ltr",
                      "format": "",
                      "indent": 0,
                      "textFormat": 0,
                      "textStyle": "",
                      "type": "paragraph",
                      "version": 1,
                    },
                    {
                      "fields": {
                        "blockType": "highlight",
                        "color": "yellow",
                        "content": {
                          "root": {
                            "children": [
                              {
                                "children": [
                                  {
                                    "detail": 0,
                                    "format": 0,
                                    "mode": "normal",
                                    "style": "",
                                    "text": "Notez une différence clé avec les blocs normaux : tous les champs ",
                                    "type": "text",
                                    "version": 1,
                                  },
                                  {
                                    "detail": 0,
                                    "format": 16,
                                    "mode": "normal",
                                    "style": "",
                                    "text": "text",
                                    "type": "text",
                                    "version": 1,
                                  },
                                  {
                                    "detail": 0,
                                    "format": 0,
                                    "mode": "normal",
                                    "style": "",
                                    "text": ", ",
                                    "type": "text",
                                    "version": 1,
                                  },
                                  {
                                    "detail": 0,
                                    "format": 16,
                                    "mode": "normal",
                                    "style": "",
                                    "text": "textarea",
                                    "type": "text",
                                    "version": 1,
                                  },
                                  {
                                    "detail": 0,
                                    "format": 0,
                                    "mode": "normal",
                                    "style": "",
                                    "text": " et ",
                                    "type": "text",
                                    "version": 1,
                                  },
                                  {
                                    "detail": 0,
                                    "format": 16,
                                    "mode": "normal",
                                    "style": "",
                                    "text": "richText",
                                    "type": "text",
                                    "version": 1,
                                  },
                                  {
                                    "detail": 0,
                                    "format": 0,
                                    "mode": "normal",
                                    "style": "",
                                    "text": " seront envoyés à Crowdin, qu'ils soient ou non ",
                                    "type": "text",
                                    "version": 1,
                                  },
                                  {
                                    "children": [
                                      {
                                        "detail": 0,
                                        "format": 0,
                                        "mode": "normal",
                                        "style": "",
                                        "text": "champs localisés",
                                        "type": "text",
                                        "version": 1,
                                      },
                                    ],
                                    "direction": "ltr",
                                    "fields": {
                                      "doc": null,
                                      "linkType": "custom",
                                      "newTab": false,
                                      "url": "https://payloadcms.com/docs/configuration/localization#field-by-field-localization",
                                    },
                                    "format": "",
                                    "indent": 0,
                                    "type": "link",
                                    "version": 2,
                                  },
                                  {
                                    "detail": 0,
                                    "format": 0,
                                    "mode": "normal",
                                    "style": "",
                                    "text": ".",
                                    "type": "text",
                                    "version": 1,
                                  },
                                ],
                                "direction": "ltr",
                                "format": "",
                                "indent": 0,
                                "textFormat": 0,
                                "textStyle": "",
                                "type": "paragraph",
                                "version": 1,
                              },
                            ],
                            "direction": "ltr",
                            "format": "",
                            "indent": 0,
                            "type": "root",
                            "version": 1,
                          },
                        },
                        "heading": {
                          "title": "Configuration des blocs dans les champs lexicaux",
                        },
                        "id": `${lexicalBlockIds[0]}`,
                      },
                      "format": "",
                      "type": "block",
                      "version": 2,
                    },
                  ],
                  "direction": "ltr",
                  "format": "",
                  "indent": 0,
                  "type": "root",
                  "version": 1,
                },
              },
              "id": `${blockIds[1]}`,
            },
          ],
          "heading": "Les champs lexicaux imbriqués sont pris en charge - et les blocs de ce champ lexical sont également traduits",
          "id": `${arrayIds[1]}`,
        },
      ]
    );
  });
});
