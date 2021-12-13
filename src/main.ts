import { Container, Service } from 'typedi';
import { CliService } from './services';

export const main = (): void => {
    Container.get(CliService).start()
};