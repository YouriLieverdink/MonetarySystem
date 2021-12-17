import 'reflect-metadata'
import { Container } from 'typedi';
import { CommandController } from '../../controllers';
import { commandControllerMock } from '../../controllers/index.mock';
import { CliService } from './';

describe ('CliService',() => {
    Container.set<CommandController>(CommandController, commandControllerMock);
    const cliService: CliService = new CliService();

    describe('Reject unknown commands', () => {

        it('command: \'test\'', () => {
            let method = jest.fn(cliService.handle);
            method('test', console);
            expect(method).toHaveReturnedWith(false);
        })
    })

    describe('Evaluate number of arguments', () => {

        describe('command: import', () => {
            let method: Function;

            beforeEach(() => {
                method = jest.fn(cliService.commands.import);
            })

            it('Accept if 1 argument', () => {
                method(['example_private_key']);
                expect(method).toHaveReturnedWith(true);
            })

            it('Reject if > 1 argument', () => {
                method(['example_private_key', 'additional_argument']);
                expect(method).toHaveReturnedWith(false);
            })

            it('Reject if no arguments', () => {
                method([]);
                expect(method).toHaveReturnedWith(false);
            })
        })

        describe('command: remove', () => {
            let method: Function;

            beforeEach(() => {
                method = jest.fn(cliService.commands.remove);
            })

            it('Accept if 1 argument', () => {
                method(['example_public_key']);
                expect(method).toHaveReturnedWith(true);
            })

            it('Reject if > 1 argument', () => {
                method(['example_public_key', 'additional_argument']);
                expect(method).toHaveReturnedWith(false);
            })

            it('Reject if no arguments', () => {
                method([]);
                expect(method).toHaveReturnedWith(false);
            })
        })

        describe('command: generate', () => {
            let method: Function;

            beforeEach(() => {
                method = jest.fn(cliService.commands.generate);
            })

            it('Accept if no arguments', () => {
                method([]);
                expect(method).toHaveReturnedWith(true);
            })

            it('Reject if any arguments', () => {
                method(['argument']);
                expect(method).toHaveReturnedWith(false);
            })
        })

        describe('command: list', () => {
            let method: Function;

            beforeEach(() => {
                method = jest.fn(cliService.commands.list);
            })

            it('Accept if no arguments', () => {
                method([]);
                expect(method).toHaveReturnedWith(true);
            })

            it('Accept if argument is \'--private\'', () => {
                method(['--private']);
                expect(method).toHaveReturnedWith(true);
            })

            it('Reject if arguments are different than \'--private\'', () => {
                method(['--private','argument']);
                expect(method).toHaveReturnedWith(false);
            })
        })

        describe('command: transactions', () => {
            let method: Function;

            beforeEach(() => {
                method = jest.fn(cliService.commands.transactions);
            })

            it('Accept if no arguments', () => {
                method([]);
                expect(method).toHaveReturnedWith(true);
            })

            it('Accept if 1 argument', () => {
                method(['example_public_key']);
                expect(method).toHaveReturnedWith(true);
            })

            it('Reject if > 1 arguments', () => {
                method(['example_public_key','additional_argument']);
                expect(method).toHaveReturnedWith(false);
            })
        })

        describe('command: balance', () => {
            let method: Function;

            beforeEach(() => {
                method = jest.fn(cliService.commands.balance);
            })

            it('Accept if no arguments', () => {
                method([]);
                expect(method).toHaveReturnedWith(true);
            })

            it('Accept if 1 argument', () => {
                method(['example_public_key']);
                expect(method).toHaveReturnedWith(true);
            })

            it('Reject if > 1 arguments', () => {
                method(['example_public_key','additional_argument']);
                expect(method).toHaveReturnedWith(false);
            })
        })

        describe('command: create-transaction', () => {
            let method: Function;

            beforeEach(() => {
                method = jest.fn(cliService.commands.createTransaction);
            })

            it('Reject if no arguments', () => {
                method([]);
                expect(method).toHaveReturnedWith(false);
            })

            it('Reject if < 3 arguments', () => {
                method(['receiver', '10']);
                expect(method).toHaveReturnedWith(false);
            })

            it('Reject if > 3 arguments', () => {
                method(['sender', 'receiver', '10', 'additional_argument']);
                expect(method).toHaveReturnedWith(false);
            })

            it('Reject if 3rd argument not Number', () => {
                method(['sender', 'receiver', 'ten']);
                expect(method).toHaveReturnedWith(false);
            })

            it('Accept if 3 arguments & last is Number', () => {
                method(['example_public_key1', 'example_public_key2', '10']);
                expect(method).toHaveReturnedWith(true);
            })
        })

        describe('command: mirror', () => {
            let method: Function;

            beforeEach(() => {
                method = jest.fn(cliService.commands.mirror);
            })

            it('Reject if no arguments', () => {
                method([]);
                expect(method).toHaveReturnedWith(false);
            })

            it('Reject if > 1 arguments', () => {
                method(['on','off']);
                expect(method).toHaveReturnedWith(false);
            })

            it('Reject if invalid argument', () => {
                method(['enable']);
                expect(method).toHaveReturnedWith(false);
            })

            it('Accept if argument \'on\'', () => {
                method(['on']);
                expect(method).toHaveReturnedWith(true);
            })

            it('Accept if argument \'off\'', () => {
                method(['off']);
                expect(method).toHaveReturnedWith(true);
            })
        })
    })
})


