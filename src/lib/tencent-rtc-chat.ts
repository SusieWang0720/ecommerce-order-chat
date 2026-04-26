type TencentChatConfig = {
  sdkAppId: number;
  userId: string;
  userSig: string;
};

export async function initTencentRtcChat(config: TencentChatConfig) {
  const [{ default: TencentCloudChat }, { default: TIMUploadPlugin }] =
    await Promise.all([import("@tencentcloud/chat"), import("tim-upload-plugin")]);

  const instance = TencentCloudChat.create({
    SDKAppID: config.sdkAppId,
  });

  instance.registerPlugin({ "tim-upload-plugin": TIMUploadPlugin });

  await instance.login({
    userID: config.userId,
    userSig: config.userSig,
  });

  return instance;
}
