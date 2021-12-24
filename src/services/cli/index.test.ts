import { CliService } from '.';
import { CommandController } from '../../controllers';

jest.mock('../../controllers', () => ({
    __esModule: true,
    CommandController: jest.fn().mockImplementation(() => {
        return {
            'addresses': {
                'getAll': jest.fn(),
                'create': jest.fn(),
                'import': jest.fn(),
                'remove': jest.fn(),
            },
            'transactions': {
                'getAll': jest.fn(),
                'getAllImported': jest.fn(),
                'create': jest.fn(),
            },
            'balances': {
                'getAll': jest.fn(),
                'get': jest.fn(),
                'getAllImported': jest.fn(),
            },
            'mirror': {
                'set': jest.fn(),
            },
        };
    }),
}));

describe('CliService', () => {
    let command: CommandController;
    let cliService: CliService;

    const mockPublicKey = 'mock-public-key';
    const mockPrivateKey = 'mock-private-key';
    const mockIsDefault = 0;

    beforeEach(() => {
        command = new CommandController();

        // Initialiase a new cli for every test.
        cliService = new CliService(command, console);
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

        beforeEach(() => {
            jest.spyOn(command.addresses, 'import').mockResolvedValue(true);
        });

        it('is rejected with no arguments', async () => {
            const result = await cliService.handle('import');
            expect(result).toBeFalsy();
        });

        it('is accepted with one argument', async () => {
            const result = await cliService.handle(`import ${mockPrivateKey}`);
            expect(result).toBeTruthy();
        });

        it('is rejected with more than one argument', async () => {
            const result = await cliService.handle(`import ${mockPrivateKey} ${mockPublicKey}`);
            expect(result).toBeFalsy();
        });
    });

    describe('command: remove', () => {

        beforeEach(() => {
            jest.spyOn(command.addresses, 'remove').mockResolvedValue(true);
        });

        it('is rejected with no arguments', async () => {
            const result = await cliService.handle('remove');
            expect(result).toBeFalsy();
        });

        it('is accepted with one argument', async () => {
            const result = await cliService.handle(`remove ${mockPublicKey}`);
            expect(result).toBeTruthy();
        });

        it('is rejected with more than one argument', async () => {
            const result = await cliService.handle(`remove ${mockPublicKey} ${mockPrivateKey}`);
            expect(result).toBeFalsy();
        });
    });

    describe('command: generate', () => {

        beforeEach(() => {
            jest.spyOn(command.addresses, 'create').mockResolvedValue({
                'publicKey': mockPublicKey,
                'privateKey': mockPrivateKey,
                'isDefault': mockIsDefault,
            });
        });

        it('is accepted with no arguments', async () => {
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

        beforeEach(() => {
            jest.spyOn(command.addresses, 'getAll').mockResolvedValue([]);
        });

        it('is accepted with no arguments', async () => {
            const result = await cliService.handle('list');
            expect(result).toBeTruthy();
        });

        it('is accepted with argument --private', async () => {
            const result = await cliService.handle('list --private');
            expect(result).toBeTruthy();
        });

        it('is rejected with arguments other than --private', async () => {
            const result = await cliService.handle('list -public');
            expect(result).toBeFalsy();
        });
    });

    describe('command: transactions', () => {

        beforeEach(() => {
            jest.spyOn(command.transactions, 'getAllImported').mockResolvedValue([]);
            jest.spyOn(command.transactions, 'getAll').mockResolvedValue([]);
        });

        it('is accepted with no arguments', async () => {
            const result = await cliService.handle('transactions');
            expect(result).toBeTruthy();
        });

        it('is accepted with one argument', async () => {
            const result = await cliService.handle(`transactions ${mockPublicKey}`);
            expect(result).toBeTruthy();
        });

        it('is rejected with more then one argument', async () => {
            const result = await cliService.handle(`transactions ${mockPublicKey} ${mockPrivateKey}`);
            expect(result).toBeFalsy();
        });
    });

    describe('command: balance', () => {

        beforeEach(() => {
            jest.spyOn(command.balances, 'getAllImported').mockResolvedValue([]);
            jest.spyOn(command.balances, 'get').mockResolvedValue({
                'publicKey': mockPublicKey,
                'date': new Date(),
                'amount': 10,
            });
        });

        it('is accepted with no arguments', async () => {
            const result = await cliService.handle('balance');
            expect(result).toBeTruthy();
        });

        it('is accepted with one argument', async () => {
            const result = await cliService.handle(`balance ${mockPublicKey}`);
            expect(result).toBeTruthy();
        });

        it('is rejected with one or more arguments', async () => {
            const result = await cliService.handle(`balance ${mockPublicKey} ${mockPrivateKey}`);
            expect(result).toBeFalsy();
        });
    });

    describe('command: transfer', () => {

        beforeEach(() => {
            jest.spyOn(command.transactions, 'create').mockResolvedValue(true);
        });

        it('is rejected with no arguments', async () => {
            const result = await cliService.handle('transfer');
            expect(result).toBeFalsy();
        });

        it('is rejected with less than three arguments', async () => {
            const result = await cliService.handle(`transfer ${mockPublicKey} ${mockPublicKey}`);
            expect(result).toBeFalsy();
        });

        it('is accepted with three arguments', async () => {
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
            const result = await cliService.handle(`transfer ${mockPublicKey} ${mockPublicKey} ${-5}`);
            expect(result).toBeFalsy();
        });
    });

    describe('command: mirror', () => {

        beforeEach(() => {
            jest.spyOn(command.mirror, 'set').mockResolvedValue(true);
        });

        it('is rejected with no arguments', async () => {
            const result = await cliService.handle('mirror');
            expect(result).toBeFalsy();
        });

        it('is accepted if argument is on', async () => {
            const result = await cliService.handle('mirror on');
            expect(result).toBeTruthy();
        });

        it('is accepted if argument is off', async () => {
            const result = await cliService.handle('mirror off');
            expect(result).toBeTruthy();
        });

        it('is rejected if argument is any other than on or off', async () => {
            const result = await cliService.handle('mirror maybe');
            expect(result).toBeFalsy();
        });

        it('is rejected with more than one argument', async () => {
            const result = await cliService.handle('mirror on 10min');
            expect(result).toBeFalsy();
        });
    });
});
