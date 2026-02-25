import { MatrixClient, MatrixEvent, MsgType } from "matrix-js-sdk";

export async function sendText(
  client: MatrixClient,
  roomId: string,
  text: string
): Promise<void> {
  await client.sendMessage(roomId, {
    msgtype: MsgType.Text,
    body: text,
  });
}

export async function sendFormattedMessage(
  client: MatrixClient,
  roomId: string,
  body: string,
  formattedBody: string
): Promise<void> {
  await client.sendMessage(roomId, {
    msgtype: MsgType.Text,
    body,
    format: "org.matrix.custom.html",
    formatted_body: formattedBody,
  });
}

export async function sendReply(
  client: MatrixClient,
  roomId: string,
  text: string,
  replyToEvent: MatrixEvent
): Promise<void> {
  const replyToId = replyToEvent.getId() ?? "";
  const replyToBody = replyToEvent.getContent()?.body ?? "";
  const replyToSender = replyToEvent.getSender() ?? "";

  const fallback = `> <${replyToSender}> ${replyToBody}\n\n${text}`;

  await client.sendMessage(roomId, {
    msgtype: MsgType.Text,
    body: fallback,
    format: "org.matrix.custom.html",
    formatted_body: `<mx-reply><blockquote><a href="https://matrix.to/#/${roomId}/${replyToId}">In reply to</a> <a href="https://matrix.to/#/${replyToSender}">${replyToSender}</a><br>${replyToBody}</blockquote></mx-reply>${text}`,
    "m.relates_to": {
      "m.in_reply_to": {
        event_id: replyToId,
      },
    },
  });
}

export async function sendGif(
  client: MatrixClient,
  roomId: string,
  gifUrl: string,
  altText: string
): Promise<void> {
  await sendFormattedMessage(
    client,
    roomId,
    `[GIF: ${altText}] ${gifUrl}`,
    `<img src="${gifUrl}" alt="${altText}" />`
  );
}

export async function removeReaction(
  client: MatrixClient,
  roomId: string,
  reactionEventId: string
): Promise<void> {
  await client.redactEvent(roomId, reactionEventId);
}

export async function sendReaction(
  client: MatrixClient,
  roomId: string,
  eventId: string,
  emoji: string
): Promise<void> {
  // m.reaction is a custom event type, so we use sendEvent with type assertion
  await (client as MatrixClient & { sendEvent: (roomId: string, eventType: string, content: unknown) => Promise<unknown> })
    .sendEvent(roomId, "m.reaction", {
      "m.relates_to": {
        rel_type: "m.annotation",
        event_id: eventId,
        key: emoji,
      },
    });
}
