// import { CliService } from '.';
// import { CommandController } from '../../controllers/command';

// describe('CliService', () => {
// 	//
// 	let command: CommandController;
// 	let cliService: CliService;

// 	const mockPublicKey = 'mock-public-key';
// 	const mockPrivateKey = 'mock-private-key';
// 	const mockIsDefault = 0;

// 	beforeEach(() => {
// 		command = new CommandController();

// 		// Initialiase a new cli for every test.
// 		cliService = new CliService(command, console);
// 	});

// 	beforeAll(() => {
// 		// Disable the console.log's.
// 		jest.spyOn(console, 'log').mockImplementation(() => undefined);
// 	});

// 	it('rejects unknown commands', () => {
// 		const result = cliService.handle('unknown');
// 		expect(result).toBeFalsy();
// 	});

// 	describe('command: import', () => {

// 		it('is rejected with no arguments', () => {
// 			const result = cliService.handle('import');
// 			expect(result).toBeFalsy();
// 		});

// 		it('is accepted with one argument', () => {
// 			jest.spyOn(command.addresses, 'import').mockReturnValue(true);

// 			const result = cliService.handle(`import ${mockPrivateKey}`);
// 			expect(result).toBeTruthy();
// 		});

// 		it('is rejected with more than one argument', () => {
// 			const result = cliService.handle(`import ${mockPrivateKey} ${mockPublicKey}`);
// 			expect(result).toBeFalsy();
// 		});
// 	});

// 	describe('command: remove', () => {

// 		it('is rejected with no arguments', () => {
// 			const result = cliService.handle('remove');
// 			expect(result).toBeFalsy();
// 		});

// 		it('is accepted with one argument', () => {
// 			jest.spyOn(command.addresses, 'remove').mockReturnValue(true);

// 			const result = cliService.handle(`remove ${mockPublicKey}`);
// 			expect(result).toBeTruthy();
// 		});

// 		it('is rejected with more than one argument', () => {
// 			const result = cliService.handle(`remove ${mockPublicKey} ${mockPrivateKey}`);
// 			expect(result).toBeFalsy();
// 		});
// 	});

// 	describe('command: generate', () => {

// 		it('is accepted with no arguments', () => {
// 			jest.spyOn(command.addresses, 'create').mockReturnValue({
// 				'publicKey': mockPublicKey,
// 				'privateKey': mockPrivateKey,
// 				'isDefault': mockIsDefault,
// 			});

// 			const result = cliService.handle('generate');
// 			expect(result).toBeTruthy();
// 		});

// 		it('is rejected with one argument', () => {
// 			const result = cliService.handle(`generate ${mockPublicKey}`);
// 			expect(result).toBeFalsy();
// 		});

// 		it('is rejected with one or more arguments', () => {
// 			const result = cliService.handle(`generate ${mockPublicKey} ${mockPrivateKey}`);
// 			expect(result).toBeFalsy();
// 		});
// 	});

// 	describe('command: list', () => {

// 		it('is accepted with no arguments', () => {
// 			jest.spyOn(command.addresses, 'getAll').mockReturnValue([]);

// 			const result = cliService.handle('list');
// 			expect(result).toBeTruthy();
// 		});

// 		it('is rejected with argument --private', () => {
// 			const result = cliService.handle('list --private');
// 			expect(result).toBeFalsy();
// 		});

// 		it('is rejected with arguments other than --private', () => {
// 			const result = cliService.handle('list -public');
// 			expect(result).toBeFalsy();
// 		});
// 	});

// 	describe('command: transactions', () => {

// 		it('is accepted with no arguments', () => {
// 			jest.spyOn(command.addresses, 'getAll').mockReturnValue([]);
// 			jest.spyOn(command.transactions, 'getAll').mockReturnValue([]);

// 			const result = cliService.handle('transactions');
// 			expect(result).toBeTruthy();
// 		});

// 		it('is accepted with one argument', () => {
// 			jest.spyOn(command.transactions, 'getAll').mockReturnValue([]);

// 			const result = cliService.handle(`transactions ${mockPublicKey}`);
// 			expect(result).toBeTruthy();
// 		});

// 		it('is rejected with more then one argument', () => {
// 			const result = cliService.handle(`transactions ${mockPublicKey} ${mockPrivateKey}`);
// 			expect(result).toBeFalsy();
// 		});
// 	});

// 	describe('command: balance', () => {

// 		it('is accepted with no arguments', () => {
// 			jest.spyOn(command.addresses, 'getAll').mockReturnValue([]);
// 			jest.spyOn(command.balances, 'get').mockReturnValue({
// 				'publicKey': mockPublicKey,
// 				'date': new Date(),
// 				'amount': 10,
// 			});

// 			const result = cliService.handle('balance');
// 			expect(result).toBeTruthy();
// 		});

// 		it('is accepted with one argument', () => {
// 			jest.spyOn(command.balances, 'get').mockReturnValue({
// 				'publicKey': mockPublicKey,
// 				'date': new Date(),
// 				'amount': 10,
// 			});

// 			const result = cliService.handle(`balance ${mockPublicKey}`);
// 			expect(result).toBeTruthy();
// 		});

// 		it('is rejected with one or more arguments', () => {
// 			const result = cliService.handle(`balance ${mockPublicKey} ${mockPrivateKey}`);
// 			expect(result).toBeFalsy();
// 		});
// 	});

// 	describe('command: transfer', () => {

// 		it('is rejected with no arguments', () => {
// 			const result = cliService.handle('transfer');
// 			expect(result).toBeFalsy();
// 		});

// 		it('is rejected with less than three arguments', () => {
// 			const result = cliService.handle(`transfer ${mockPublicKey} ${mockPublicKey}`);
// 			expect(result).toBeFalsy();
// 		});

// 		it('is accepted with three arguments', () => {
// 			jest.spyOn(command.transactions, 'create').mockReturnValue(true);

// 			const result = cliService.handle(`transfer ${mockPublicKey} ${mockPrivateKey} ${5}`);
// 			expect(result).toBeTruthy();
// 		});

// 		it('is rejected with more than three arguments', () => {
// 			const result = cliService.handle(`transfer ${mockPublicKey} ${mockPrivateKey} ${5} ${5}`);
// 			expect(result).toBeFalsy();
// 		});

// 		it('is rejected if the third argument is not a number', () => {
// 			const result = cliService.handle(`transfer ${mockPublicKey} ${mockPublicKey} vijf`);
// 			expect(result).toBeFalsy();
// 		});

// 		it('is rejected if the last argument is negative', () => {
// 			jest.spyOn(command.transactions, 'create').mockImplementation((_, __, ___) => {
// 				throw Error('Amount can not be negative.');
// 			});

// 			const result = cliService.handle(`transfer ${mockPublicKey} ${mockPublicKey} ${-5}`);
// 			expect(result).toBeFalsy();
// 		});
// 	});

// 	describe('command: mirror', () => {

// 		it('is rejected with no arguments', () => {
// 			const result = cliService.handle('mirror');
// 			expect(result).toBeFalsy();
// 		});

// 		it('is accepted if argument is on', () => {
// 			jest.spyOn(command.mirror, 'set').mockReturnValue(true);

// 			const result = cliService.handle('mirror on');
// 			expect(result).toBeTruthy();
// 		});

// 		it('is accepted if argument is on', () => {
// 			jest.spyOn(command.mirror, 'set').mockReturnValue(true);

// 			const result = cliService.handle('mirror off');
// 			expect(result).toBeTruthy();
// 		});

// 		it('is rejected if argument is any other than on or off', () => {
// 			jest.spyOn(command.mirror, 'set').mockReturnValue(true);

// 			const result = cliService.handle('mirror maybe');
// 			expect(result).toBeFalsy();
// 		});

// 		it('is rejected with more than one argument', () => {
// 			const result = cliService.handle('mirror on 10min');
// 			expect(result).toBeFalsy();
// 		});
// 	});
// });
