import {
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';

export class RetabExtract implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Retab Extract',
		name: 'retab',
		icon: 'file:retab.svg',
		group: ['ai'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Interact with the Retab API for document extraction',
		defaults: {
			name: 'Retab Extract',
		},
		credentials: [
			{
				name: 'retabApi',
				required: true,
			},
		],
		requestDefaults: {
			baseURL: 'https://api.retab.com/v1',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
		},
		properties: [
			// Resource Selector
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Document',
						value: 'document',
					},
				],
				default: 'document',
			},
			// Operation Selector
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['document'],
					},
				},
				options: [
					{
						name: 'Extract',
						value: 'extract',
						action: 'Extract data from documents',
						description: 'Extract structured data from one or more documents',
					},
				],
				default: 'extract',
			},

			// ----------------------------------------
			// Fields for Document: Extract
			// ----------------------------------------
			{
				displayName: 'Input Binary Property',
				name: 'binaryPropertyName',
				type: 'string',
				default: 'data',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['extract'],
					},
				},
				description: 'Name of the binary property on input items to use as the document source. The node will process one document per input item.',
			},
			{
				displayName: 'Model',
				name: 'model',
				type: 'string',
				required: true,
				default: 'gpt-4o',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['extract'],
					},
				},
				description: 'Model used for chat completion (e.g., gpt-4o, claude-3-opus-20240229)',
			},
			{
				displayName: 'JSON Schema',
				name: 'jsonSchema',
				type: 'json',
				required: true,
				default: '{\n  "type": "object",\n  "properties": {\n    "invoice_number": {\n      "type": "string"\n    },\n    "total_amount": {\n      "type": "number"\n    }\n  }\n}',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['extract'],
					},
				},
				description: 'JSON schema format used to validate the output data',
			},
			{
				displayName: 'Modality',
				name: 'modality',
				type: 'options',
				required: true,
				default: 'pdf',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['extract'],
					},
				},
				options: [
					{ name: 'PDF', value: 'pdf' },
					{ name: 'Image', value: 'image' },
					{ name: 'HTML', value: 'html' },
				],
				description: 'The modality of the document(s) being analyzed',
			},
			{
				displayName: 'Additional Fields',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Add Field',
				default: {},
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['extract'],
					},
				},
				options: [
					{
						displayName: 'Temperature',
						name: 'temperature',
						type: 'number',
						typeOptions: {
							minValue: 0,
							maxValue: 2,
						},
						default: 0.0,
						description: 'Temperature for sampling. Cannot be 0 if N Consensus is > 1.',
					},
					{
						displayName: 'N Consensus',
						name: 'nConsensus',
						type: 'number',
						typeOptions: {
							minValue: 1,
						},
						default: 1,
						description: 'Number of consensus models to use. If > 1, temperature cannot be 0.',
					},
					{
						displayName: 'Reasoning Effort',
						name: 'reasoningEffort',
						type: 'options',
						default: 'medium',
						options: [
							{ name: 'Low', value: 'low' },
							{ name: 'Medium', value: 'medium' },
							{ name: 'High', value: 'high' },
						],
						description: 'The effort level for the model to reason about the input data',
					},
					{
						displayName: 'Image Resolution (DPI)',
						name: 'imageResolutionDpi',
						type: 'number',
						default: 96,
						description: 'Resolution of the image sent to the LLM',
					},
					{
						displayName: 'Browser Canvas',
						name: 'browserCanvas',
						type: 'options',
						default: 'A4',
						options: [
							{ name: 'A4', value: 'A4' },
							{ name: 'A3', value: 'A3' },
							{ name: 'Letter', value: 'Letter' },
							{ name: 'Legal', value: 'Legal' },
						],
						description: 'Sets the size of the browser canvas for rendering documents',
					},
				],
			},
		],

		// Define the API call logic
		operations: [
			{
				displayName: 'Extract',
				name: 'extract',
				action: 'Extract data from documents',
				mode: 'runOnceForAllItems',
				routing: {
					request: {
						method: 'POST',
						url: '/documents/extractions',
						body: {
							// --- Required Fields ---
							modality: '={{$parameter.modality}}',
							model: '={{$parameter.model}}',
							json_schema: '={{JSON.parse($parameter.jsonSchema)}}',
							documents: '={{ $items().map(item => ({ data: item.binary[$parameter.binaryPropertyName].data, mimeType: item.binary[$parameter.binaryPropertyName].mimeType })) }}',
							temperature: '={{$parameter.temperature}}',
							n_consensus: '={{$parameter.nConsensus}}',
							reasoning_effort: '={{$parameter.reasoningEffort}}',
							image_resolution_dpi: '={{$parameter.imageResolutionDpi}}',
							browser_canvas: '={{$parameter.browserCanvas}}',
						},
					},
					output: {
						postReceive: [
							{
								type: 'rootProperty',
								properties: {
									property: 'data',
								},
							},
						],
					},
				},
			},
		],
	};
}