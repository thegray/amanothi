export type GoogleTokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token: string;
};

export type GoogleUser = {
  id: string;
  email: string;
  name: string;
  picture: string;
};

export type AuthUser = {
  id: bigint;
  email: string;
  displayName: string | null;
};
