import { useMutation, useQuery, useQueryClient,UseQueryResult } from "@tanstack/react-query";

import { apiRequest } from "@app/config/request";

import { decryption } from "./helper";
import { PersonalSecret, UnencryptedPersonalSecret } from "./types";

const personalSecrets = {
  getPersonalSecret: (personalSecretId: string) =>
    ["personal-secret", { personalSecretId }] as const,
  getAllPersonalSecrets: (orgId: string) => ["personal-secrets", { orgId }] as const
};

export const useGetPersonalSecret = (personalSecretId: string) => {
  return useQuery({
    queryKey: personalSecrets.getPersonalSecret(personalSecretId),
    queryFn: async () => {
      const { data } = await apiRequest.get<{ personalSecret: PersonalSecret }>(
        `/api/v3/personal-secrets/${personalSecretId}`
      );
      return data.personalSecret;
    },
    enabled: true
  });
};

export const useCreatePersonalSecret = () => {
  const queryClient = useQueryClient();

  return useMutation<
    PersonalSecret,
    {},
    Omit<PersonalSecret, "updatedAt" | "createdAt" | "personalSecretKeyId" | "userId">
  >({
    mutationFn: async (newSecret) => {
      const { data } = await apiRequest.post<{ personalSecret: PersonalSecret }>(
        "/api/v3/personal-secrets",
        newSecret
      );
      return data.personalSecret;
    },
    onSuccess: () => {
      queryClient.clear();
    }
  });
};

export const useGetAllPersonalSecrets = (
  orgId: string
): UseQueryResult<UnencryptedPersonalSecret[], Error> => {
  return useQuery({
    queryKey: ["personal-secrets", { orgId }],
    queryFn: async () => {
      const { data } = await apiRequest.get<PersonalSecret[]>("/api/v3/personal-secrets");
      const decryptedSecrets = await Promise.all(data?.length ? data.map(decryption) : []);
      return decryptedSecrets;
    },
    enabled: true
  });
};

export const useDeletePersonalSecret = () => {
  const queryClient = useQueryClient();

  return useMutation<void, {}, string>({
    mutationFn: async (personalSecretId) => {
      await apiRequest.delete(`/api/v3/personal-secrets/${personalSecretId}`);
    },
    onSuccess: () => {
      queryClient.clear();
      queryClient.invalidateQueries(personalSecrets.getAllPersonalSecrets("orgId"));
    }
  });
};

export const useUpdatePersonalSecret = () => {
  const queryClient = useQueryClient();

  return useMutation<PersonalSecret, {}, PersonalSecret>({
    mutationFn: async (updatedSecret) => {
      const { data } = await apiRequest.put<{ personalSecret: PersonalSecret }>(
        `/api/v3/personal-secrets/${updatedSecret.personalSecretKeyId}`,
        updatedSecret
      );
      return data.personalSecret;
    },
    onSuccess: () => {
      queryClient.clear();
      queryClient.invalidateQueries(personalSecrets.getAllPersonalSecrets("orgId"));
    }
  });
};
