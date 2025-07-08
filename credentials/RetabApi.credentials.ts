import {
	IAuthenticate,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class RetabApi implements ICredentialType {
	name = 'retabApi';
	displayName = 'Retab API';
	documentationUrl = 'https://docs.retab.com/api'; // Replace with actual URL if available
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Your Retab API Key',
		},
	];

	// The authenticate method tells n8n how to use the credentials
	authenticate: IAuthenticate = {
		type: 'generic',
		properties: {
            headers: {
                'Api-Key': '={{ $credentials.apiKey }}',
            }
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://api.retab.com/v1',
			url: '/models/',
		},
	};
}
