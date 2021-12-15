import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Service } from 'typedi';

@Service()
export class HttpService {
	/**
	 * Do the http request.
	 * 
	 * @param config The configuration for the request.
	 * @returns The received response.
	 */
	private async doRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
		try {
			return await axios.request(config);
		}
		catch (e) {
			// Cast the exception.
			const error: AxiosError = e;

			if (error.response) {
				// An response outside the range of 2xx was received.
				throw { 'type': 'response', 'error': error };
			}

			if (error.request) {
				// The request could not be delivered.
				throw { 'type': 'request', 'error': error };
			}

			throw { 'type': 'unknown', 'error': error };
		}
	}

	/**
	 * Sends a POST request.
	 * 
	 * @param host The host, in format ip:port, to send the request to.
	 * @param uri The endpoint to send the request to.
	 * @param data The body of the request.
	 */
	public async post(host: string, uri: string, data: Record<string, unknown>): Promise<AxiosResponse> {
		// Create the configuration.
		const config: AxiosRequestConfig = {
			'baseURL': `https://${host}`,
			'url': uri,
			'method': 'POST',
			'data': data,
		};

		return await this.doRequest(config);
	}
}