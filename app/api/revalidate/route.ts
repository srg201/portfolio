import { revalidateTag } from "next/cache";
import { type NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { CONTENT_TAG } from "@/lib/content";

/**
 * Вебхук Sanity: после публикации или удаления документа сбрасывает кеш
 * контента, и сайт обновляется без пересборки.
 * Подпись проверяется секретом SANITY_REVALIDATE_SECRET (тот же секрет
 * указывается в настройках вебхука в sanity.io/manage).
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json({ message: "Webhook is not configured" }, { status: 503 });
  }

  try {
    // true: подождать, пока изменения дойдут до API (иначе кеш наполнится старыми данными)
    const { isValidSignature, body } = await parseBody<{ _type?: string }>(request, secret, true);
    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
    revalidateTag(CONTENT_TAG, { expire: 0 });
    return NextResponse.json({ revalidated: true, type: body?._type ?? null });
  } catch (error) {
    console.error("Revalidate webhook:", error instanceof Error ? error.message : error);
    return NextResponse.json({ message: "Bad request" }, { status: 400 });
  }
}
