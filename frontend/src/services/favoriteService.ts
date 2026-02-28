import api from "../api/axios";
import type { Vehicle } from "../types/vehicle";

export const getFavoriteVehicles = async (
  iris: string[],
): Promise<Vehicle[]> => {
  const results = await Promise.allSettled(
    iris.map((iri) =>
      api.get(iri.replace("/api/", "/")).then((r) => r.data as Vehicle),
    ),
  );
  return results
    .filter(
      (r): r is PromiseFulfilledResult<Vehicle> => r.status === "fulfilled",
    )
    .map((r) => r.value);
};
