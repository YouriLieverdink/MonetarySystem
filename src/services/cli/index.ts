import { Service } from 'typedi';

@Service()
export class CliService {

	private counter = 0;

	public logSomething() {
		this.counter = this.counter + 1;
		console.log(`Count: ${this.counter}`);
	}
}