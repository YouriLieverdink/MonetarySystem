import axios, { AxiosInstance } from 'axios';
import { Shell } from './shell';

jest.mock('axios');

describe('Shell', () => {
    let http: AxiosInstance;
    let shell: Shell;

    // Mocks.
    let log: jest.SpyInstance;
    let clear: jest.SpyInstance;

    beforeAll(() => {
        // We disable console.log to hide the logging of any output from the shell.
        log = jest.spyOn(global.console, 'log').mockImplementation(() => { });
        clear = jest.spyOn(global.console, 'clear').mockImplementation(() => { });

        http = axios.create();
        shell = new Shell(http);
    });

    beforeEach(() => {
        log.mockClear();
        clear.mockClear();
    });

    it('clears the screen and displays Tritium on creation', () => {
        new Shell(http);

        expect(clear).toBeCalled();
        expect(log.mock.calls[0][0]).toContain(`Enter 'help' to display command line options`);
    });

    describe('handle', () => {
        //
    });
});