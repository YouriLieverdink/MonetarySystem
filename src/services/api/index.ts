import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export class ApiService {
	/**
	 * @param config Configuration for the request.
	 */
	private async doRequest(config: AxiosRequestConfig): Promise<AxiosResponse> {
		try {
			return await axios.request(config);
		} //
		catch (e) {
			// Type the occured exception.
			const error: AxiosError = e;

			if (error.response) {
				// The network node returned an error response.
				throw { 'code': 'error-response', 'error': error };
			}

			if (error.request) {
				// The network node did not respond.
				throw { 'code': 'error-unreachable', 'error': error };
			}
		}
	}

	/**
	 * Make a get request.
	 * 
	 * @param address The address of the network node.
	 * @param uri The endpoint to which the request must be send.
	 */
	public async getFromApi(address: string, uri: string): Promise<AxiosResponse> {

		const config: AxiosRequestConfig = {
			'method': 'GET',
			'baseURL': address,
			'url': uri,
		};

		return this.doRequest(config);
	}

	/**
	 * Make a post request.
	 * 
	 * @param address The address of the network node.
	 * @param uri The endpoint to which the request must be send.
	 * @param data The request body.
	 */
	public async postToApi(address: string, uri: string, data: unknown): Promise<AxiosResponse> {

		const config: AxiosRequestConfig = {
			'method': 'POST',
			'baseURL': address,
			'url': uri,
			'data': data,
		};

		return this.doRequest(config);
	}
}