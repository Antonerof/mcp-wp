// src/tools/block-types.ts
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { makeWordPressRequest, logToFile } from '../wordpress.js';

export const blockTypesTools: Tool[] = [
  {
    name: 'mcp_wordpress_loc_list_block_types',
    description: 'List all available block types in WordPress, including core blocks and custom blocks',
    inputSchema: {
      type: 'object',
      properties: {
        context: {
          type: 'string',
          enum: ['view', 'embed', 'edit'],
          description: 'Scope under which the request is made (defaults to view)'
        },
        namespace: {
          type: 'string',
          description: 'Limit results to blocks of a specific namespace (e.g., "core", "custom")'
        }
      },
      additionalProperties: false
    } as const
  },
  {
    name: 'mcp_wordpress_loc_get_block_type',
    description: 'Get details about a specific block type',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'The block type name (e.g., "core/paragraph", "core/heading")'
        },
        context: {
          type: 'string',
          enum: ['view', 'embed', 'edit'],
          description: 'Scope under which the request is made (defaults to view)'
        }
      },
      required: ['name'],
      additionalProperties: false
    } as const
  }
];

const ListBlockTypesSchema = z.object({
  context: z.enum(['view', 'embed', 'edit']).optional(),
  namespace: z.string().optional()
});

const GetBlockTypeSchema = z.object({
  name: z.string(),
  context: z.enum(['view', 'embed', 'edit']).optional()
});

export const blockTypesHandlers = {
  get_list_block_types: async (args: any) => {
    try {
      const { context, namespace } = ListBlockTypesSchema.parse(args);
      
      const params = new URLSearchParams();
      if (context) params.append('context', context);
      if (namespace) params.append('namespace', namespace);
      
      const queryString = params.toString();
      const endpoint = `block-types${queryString ? `?${queryString}` : ''}`;
      
      const response = await makeWordPressRequest('GET', endpoint);
      
      return {
        toolResult: {
          content: [
            {
              type: 'text',
              text: `Found ${Array.isArray(response) ? response.length : Object.keys(response).length} block types${namespace ? ` in namespace "${namespace}"` : ''}:\n\n${JSON.stringify(response, null, 2)}`
            }
          ],
          isError: false
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          content: [
            {
              type: 'text',
              text: `Error listing block types: ${error.message}`
            }
          ],
          isError: true
        }
      };
    }
  },

  get_block_type: async (args: any) => {
    try {
      const { name, context } = GetBlockTypeSchema.parse(args);
      
      const params = new URLSearchParams();
      if (context) params.append('context', context);
      
      const queryString = params.toString();
      const endpoint = `block-types/${encodeURIComponent(name)}${queryString ? `?${queryString}` : ''}`;
      
      const response = await makeWordPressRequest('GET', endpoint);
      
      return {
        toolResult: {
          content: [
            {
              type: 'text',
              text: `Block type "${name}" details:\n\n${JSON.stringify(response, null, 2)}`
            }
          ],
          isError: false
        }
      };
    } catch (error: any) {
      return {
        toolResult: {
          content: [
            {
              type: 'text',
              text: `Error getting block type "${args.name}": ${error.message}`
            }
          ],
          isError: true
        }
      };
    }
  }
};
