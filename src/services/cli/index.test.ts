import { Container } from 'typedi';
import { CommandController } from '../../controllers';
import { commandControllerMock } from '../../controllers/command/index.mock';
import { CliService } from './';

describe('CliService', () => {
    Container.set<CommandController>(CommandController, commandControllerMock);
    const cliService: CliService = new CliService();
    const handle = jest.spyOn(cliService, 'handle');

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(() => undefined);
    });

    describe('Reject unknown commands', () => {

        it('command: \'test\'', () => {
            cliService.handle('test');
            expect(handle).toHaveReturnedWith(false);
        });
    });

    describe('Evaluate number of arguments', () => {

        describe('command: import', () => {
            const command = 'import';

            it('Accept if 1 argument', () => {
                cliService.handle(`${command} example_private_key`);
                expect(handle).toHaveReturnedWith(true);
            });

            it('Reject if > 1 argument', () => {
                cliService.handle(`${command} example_private_key additional_argument`);
                expect(handle).toHaveReturnedWith(false);
            });

            it('Reject if no arguments', () => {
                cliService.handle(command);
                expect(handle).toHaveReturnedWith(false);
            });
        });

        describe('command: remove', () => {
            const command = 'remove';

            it('Accept if 1 argument', () => {
                cliService.handle(`${command} example_public_key`);
                expect(handle).toHaveReturnedWith(true);
            });

            it('Reject if > 1 argument', () => {
                cliService.handle(`${command} example_public_key additional_argument`);
                expect(handle).toHaveReturnedWith(false);
            });

            it('Reject if no arguments', () => {
                cliService.handle(command);
                expect(handle).toHaveReturnedWith(false);
            });
        });

        describe('command: generate', () => {
            const command = 'generate';

            it('Accept if no arguments', () => {
                cliService.handle(command);
                expect(handle).toHaveReturnedWith(true);
            });

            it('Reject if any arguments', () => {
                cliService.handle(`${command} argument`);
                expect(handle).toHaveReturnedWith(false);
            });
        });

        describe('command: list', () => {
            const command = 'list';

            it('Accept if no arguments', () => {
                cliService.handle(command);
                expect(handle).toHaveReturnedWith(true);
            });

            it('Accept if argument is \'--private\'', () => {
                cliService.handle(`${command} --private`);
                expect(handle).toHaveReturnedWith(true);
            });

            it('Reject if arguments are different than \'--private\'', () => {
                cliService.handle(`${command} --private argument`);
                expect(handle).toHaveReturnedWith(false);
            });
        });

        describe('command: transactions', () => {
            const command = 'transactions';

            it('Accept if no arguments', () => {
                cliService.handle(command);
                expect(handle).toHaveReturnedWith(true);
            });

            it('Accept if 1 argument', () => {
                cliService.handle(`${command} example_public_key`);
                expect(handle).toHaveReturnedWith(true);
            });

            it('Reject if > 1 arguments', () => {
                cliService.handle(`${command} example_public_key additional_argument`);
                expect(handle).toHaveReturnedWith(false);
            });
        });

        describe('command: balance', () => {
            const command = 'balance';

            it('Accept if no arguments', () => {
                cliService.handle(command);
                expect(handle).toHaveReturnedWith(true);
            });

            it('Accept if 1 argument', () => {
                cliService.handle(`${command} example_public_key`);
                expect(handle).toHaveReturnedWith(true);
            });

            it('Reject if > 1 arguments', () => {
                cliService.handle(`${command} example_public_key additional_argument`);
                expect(handle).toHaveReturnedWith(false);
            });
        });

        describe('command: create-transaction', () => {
            const command = 'create-transaction';

            it('Reject if no arguments', () => {
                cliService.handle(command);
                expect(handle).toHaveReturnedWith(false);
            });

            it('Reject if < 3 arguments', () => {
                cliService.handle(`${command} receiver 10`);
                expect(handle).toHaveReturnedWith(false);
            });

            it('Reject if > 3 arguments', () => {
                cliService.handle(`${command} sender receiver 10 additional_argument`);
                expect(handle).toHaveReturnedWith(false);
            });

            it('Reject if 3rd argument not Number', () => {
                cliService.handle(`${command} sender receiver ten`);
                expect(handle).toHaveReturnedWith(false);
            });

            it('Accept if 3 arguments & last is Number', () => {
                cliService.handle(`${command} example_public_key1 example_public_key2 10`);
                expect(handle).toHaveReturnedWith(true);
            });
        });

        describe('command: mirror', () => {
            const command = 'mirror';

            it('Reject if no arguments', () => {
                cliService.handle(command);
                expect(handle).toHaveReturnedWith(false);
            });

            it('Reject if > 1 arguments', () => {
                cliService.handle(`${command} on off`);
                expect(handle).toHaveReturnedWith(false);
            });

            it('Reject if invalid argument', () => {
                cliService.handle(`${command} enable`);
                expect(handle).toHaveReturnedWith(false);
            });

            it('Accept if argument \'on\'', () => {
                cliService.handle(`${command} on`);
                expect(handle).toHaveReturnedWith(true);
            });

            it('Accept if argument \'off\'', () => {
                cliService.handle(`${command} off`);
                expect(handle).toHaveReturnedWith(true);
            });
        });
    });
});


