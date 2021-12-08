import { ApiService } from "./api";
import { CliService } from "./cli";
import { ConsensusService } from "./consensus";
import { GossipService } from "./gossip";
import { StateService } from "./state";
import { StorageService } from "./storage";

/**
 * Use the api service.
 * 
 * @returns An instance of the api service.
 */
export const useApi = () => new ApiService();

/**
 * Use the cli service.
 * 
 * @returns An instance of the cli service.
 */
export const useCli = () => new CliService();

/**
 * Use the consensus service.
 * 
 * @returns An instance of the consensus service.
 */
export const useConsensus = () => new ConsensusService();

/**
 * Use the gossip service.
 * 
 * @returns An instance of the gossip service.
 */
export const useGossip = () => new GossipService();

/**
 * Use the state service.
 * 
 * @returns An instance of the state service.
 */
export const useState = () => new StateService();

/**
 * Use the storage service.
 * 
 * @returns An instance of the storage service.
 */
export const useStorage = () => new StorageService();