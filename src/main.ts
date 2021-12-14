import { Container } from 'typedi';
import { StorageService } from './services';

export const main = (): void => {

	Container.get(StorageService);
};