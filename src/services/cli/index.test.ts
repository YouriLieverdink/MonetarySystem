import Container from 'typedi';
import { CliService } from '.';
import { CommandController } from '../../controllers';

describe('CliService', () => {
    let command: CommandController;
    let cliService: CliService;

    const mockPublicKey = 'mock-public-key';
    const mockPrivateKey = 'mock-private-key';
    const mockIsDefault = 0;

    beforeEach(() => {
        command = new CommandController();
        Container.set(CommandController, command);

        // Initialiase a new cli for every test.
        cliService = new CliService();
    });

    beforeAll(() => {
        // Disable the console.log's.
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    it('rejects unknown commands', async () => {
        const result = await cliService.handle('unknown');
        expect(result).toBeFalsy();
    });

    describe('command: import', () => {

        it('is rejected with no arguments', async () => {
            const result = await cliService.handle('import');
            expect(result).toBeFalsy();
        });

        it('is accepted with one argument', async () => {
            jest.spyOn(command.addresses, 'import').mockReturnValue(new Promise(resolve => resolve(true)));

            const result = await cliService.handle(`import ${mockPrivateKey}`);
            expect(result).toBeTruthy();
        });

        it('is rejected with more than one argument', async () => {
            const result = await cliService.handle(`import ${mockPrivateKey} ${mockPublicKey}`);
            expect(result).toBeFalsy();
        });
    });

    describe('command: remove', () => {

        it('is rejected with no arguments', async () => {
            const result = await cliService.handle('remove');
            expect(result).toBeFalsy();
        });

        it('is accepted with one argument', async () => {
            jest.spyOn(command.addresses, 'remove').mockReturnValue(new Promise(resolve => resolve(true)));

            const result = await cliService.handle(`remove ${mockPublicKey}`);
            expect(result).toBeTruthy();
        });

        it('is rejected with more than one argument', async () => {
            const result = await cliService.handle(`remove ${mockPublicKey} ${mockPrivateKey}`);
            expect(result).toBeFalsy();
        });
    });

    describe('command: generate', () => {

        it('is accepted with no arguments', async () => {
            jest.spyOn(command.addresses, 'create').mockReturnValue(new Promise (resolve => resolve({
                'publicKey': mockPublicKey,
                'privateKey': mockPrivateKey,
                'isDefault': mockIsDefault,
            })));

            const result = await cliService.handle('generate');
            expect(result).toBeTruthy();
        });

        it('is rejected with one argument', async () => {
            const result = await cliService.handle(`generate ${mockPublicKey}`);
            expect(result).toBeFalsy();
        });

        it('is rejected with one or more arguments', async () => {
            const result = await cliService.handle(`generate ${mockPublicKey} ${mockPrivateKey}`);
            expect(result).toBeFalsy();
        });
    });

    describe('command: list', () => {

        it('is accepted with no arguments', async () => {
            jest.spyOn(command.addresses, 'getAll').mockReturnValue(new Promise(resolve => resolve([])));

            const result = await cliService.handle('list');
            expect(result).toBeTruthy();
        });

        it('is rejected with argument --private', async () => {
            const result = await cliService.handle('list --private');
            expect(result).toBeFalsy();
        });

        it('is rejected with arguments other than --private', async () => {
            const result = await cliService.handle('list -public');
            expect(result).toBeFalsy();
        });
    });

    describe('command: transactions', () => {

        it('is accepted with no arguments', async () => {
            jest.spyOn(command.addresses, 'getAll').mockReturnValue(new Promise(resolve => resolve([])));
            jest.spyOn(command.transactions, 'getAll').mockReturnValue(new Promise(resolve => resolve([])));

            const result = await cliService.handle('transactions');
            expect(result).toBeTruthy();
        });

        it('is accepted with one argument', async () => {
            jest.spyOn(command.transactions, 'getAll').mockReturnValue(new Promise(resolve => resolve([])));

            const result = await cliService.handle(`transactions ${mockPublicKey}`);
            expect(result).toBeTruthy();
        });

        it('is rejected with more then one argument', async () => {
            const result = await cliService.handle(`transactions ${mockPublicKey} ${mockPrivateKey}`);
            expect(result).toBeFalsy();
        });
    });

    describe('command: balance', () => {

        it('is accepted with no arguments', async () => {
            jest.spyOn(command.addresses, 'getAll').mockReturnValue(new Promise(resolve => resolve([])));
            jest.spyOn(command.balances, 'get').mockReturnValue(new Promise(resolve => resolve({
                'publicKey': mockPublicKey,
                'date': new Date(),
                'amount': 10,
            })));

            const result = await cliService.handle('balance');
            expect(result).toBeTruthy();
        });

        it('is accepted with one argument', async () => {
            jest.spyOn(command.balances, 'get').mockReturnValue(new Promise(resolve => resolve({
                'publicKey': mockPublicKey,
                'date': new Date(),
                'amount': 10,
            })));

            const result = await cliService.handle(`balance ${mockPublicKey}`);
            expect(result).toBeTruthy();
        });

        it('is rejected with one or more arguments', async () => {
            const result = await cliService.handle(`balance ${mockPublicKey} ${mockPrivateKey}`);
            expect(result).toBeFalsy();
        });
    });

    describe('command: transfer', () => {

        it('is rejected with no arguments', async () => {
            const result = await cliService.handle('transfer');
            expect(result).toBeFalsy();
        });

        it('is rejected with less than three arguments', async () => {
            const result = await cliService.handle(`transfer ${mockPublicKey} ${mockPublicKey}`);
            expect(result).toBeFalsy();
        });

        it('is accepted with three arguments', async () => {
            jest.spyOn(command.transactions, 'create').mockReturnValue(new Promise(resolve => resolve(true)));

            const result = await cliService.handle(`transfer ${mockPublicKey} ${mockPrivateKey} ${5}`);
            expect(result).toBeTruthy();
        });

        it('is rejected with more than three arguments', async () => {
            const result = await cliService.handle(`transfer ${mockPublicKey} ${mockPrivateKey} ${5} ${5}`);
            expect(result).toBeFalsy();
        });

        it('is rejected if the third argument is not a number', async () => {
            const result = await cliService.handle(`transfer ${mockPublicKey} ${mockPublicKey} vijf`);
            expect(result).toBeFalsy();
        });

        it('is rejected if the last argument is negative', async () => {
            jest.spyOn(command.transactions, 'create').mockImplementation((_, __, ___) => {
                throw Error('Amount can not be negative.');
            });

            const result = await cliService.handle(`transfer ${mockPublicKey} ${mockPublicKey} ${-5}`);
            expect(result).toBeFalsy();
        });
    });

    describe('command: mirror', () => {

        it('is rejected with no arguments', async () => {
            const result = await cliService.handle('mirror');
            expect(result).toBeFalsy();
        });

        it('is accepted if argument is on', async () => {
            jest.spyOn(command.mirror, 'set').mockReturnValue(new Promise(resolve => resolve(true)));

            const result = await cliService.handle('mirror on');
            expect(result).toBeTruthy();
        });

        it('is accepted if argument is off', async () => {
            jest.spyOn(command.mirror, 'set').mockReturnValue(new Promise(resolve => resolve(true)));

            const result = await cliService.handle('mirror off');
            expect(result).toBeTruthy();
        });

        it('is rejected if argument is any other than on or off', async () => {
            jest.spyOn(command.mirror, 'set').mockReturnValue(new Promise(resolve => resolve(true)));

            const result = await cliService.handle('mirror maybe');
            expect(result).toBeFalsy();
        });

        it('is rejected with more than one argument', async () => {
            const result = await cliService.handle('mirror on 10min');
            expect(result).toBeFalsy();
        });
    });
});
