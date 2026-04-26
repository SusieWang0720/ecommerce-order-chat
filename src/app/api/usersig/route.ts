import { NextResponse } from "next/server";

type UserSigRequest = {
  userId?: string;
};

export async function POST(request: Request) {
  const { userId }: UserSigRequest = await request.json().catch(() => ({}));
  const sdkAppId = Number(process.env.NEXT_PUBLIC_TENCENT_SDK_APP_ID);
  const secretKey = process.env.TENCENT_SDK_SECRET_KEY;
  const expireSeconds = Number(process.env.TENCENT_USERSIG_EXPIRE_SECONDS || 604800);

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  if (!sdkAppId || !secretKey) {
    return NextResponse.json(
      {
        error:
          "Tencent RTC Chat SDK credentials are not configured. Add NEXT_PUBLIC_TENCENT_SDK_APP_ID and TENCENT_SDK_SECRET_KEY on the server.",
      },
      { status: 400 },
    );
  }

  const TLSSigAPIv2 = await import("tls-sig-api-v2");
  const generator = new TLSSigAPIv2.Api(sdkAppId, secretKey);
  const userSig = generator.genUserSig(userId, expireSeconds);

  return NextResponse.json({
    sdkAppId,
    userId,
    userSig,
    expireSeconds,
  });
}
