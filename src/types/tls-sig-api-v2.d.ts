declare module "tls-sig-api-v2" {
  export class Api {
    constructor(sdkAppId: number, secretKey: string);
    genUserSig(userId: string, expireSeconds: number): string;
  }
}
