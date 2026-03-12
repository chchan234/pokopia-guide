/// <reference lib="webworker" />

import { buildHousePlans, type PlannerPokemon } from '../lib/house-planner-engine';

interface PlannerWorkerRequest {
  requestId: number;
  ownedPokemon: PlannerPokemon[];
}

interface PlannerWorkerResponse {
  requestId: number;
  result: ReturnType<typeof buildHousePlans>;
}

self.onmessage = (event: MessageEvent<PlannerWorkerRequest>) => {
  const result = buildHousePlans(event.data.ownedPokemon);

  const response: PlannerWorkerResponse = {
    requestId: event.data.requestId,
    result,
  };

  self.postMessage(response);
};

export {};
