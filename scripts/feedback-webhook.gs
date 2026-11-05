/**
 * Ask Algeria feedback + contact webhook (Google Apps Script, bound to the team's Google Sheet).
 * The site posts each "Was this helpful?" rating and each Contact us message here (FEEDBACK_WEBHOOK_URL).
 * Ratings go to the "Feedback" tab; contact messages go to the "Contact" tab and are emailed to SUPPORT_EMAIL.
 *
 * Setup: in the Sheet, Extensions > Apps Script, paste this file, set KEY (the same value as FEEDBACK_WEBHOOK_KEY
 * in Vercel), then Deploy > New deployment > Web app, Execute as: Me, Who has access: Anyone. Put the /exec URL
 * in FEEDBACK_WEBHOOK_URL. Never commit the real key.
 */
const KEY = "PASTE_FEEDBACK_WEBHOOK_KEY_HERE";
const SUPPORT_EMAIL = "support@ixlconsulting.tech";

const COLUMNS = {
  Contact: ["at", "message", "replyTo", "lang"],
  Feedback: ["at", "rating", "reason", "comment", "question", "context", "answer", "lang", "sources"],
};

function doPost(e) {
  let d;
  try {
    d = JSON.parse(e.postData.contents);
  } catch (err) {
    return reply("bad request");
  }
  if (!d || d.key !== KEY) return reply("forbidden");
  delete d.key;

  const tab = d.kind === "contact" ? "Contact" : "Feedback";
  const cols = COLUMNS[tab];
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(tab) || ss.insertSheet(tab);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(cols);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow(cols.map((c) => (d[c] === undefined || d[c] === null ? "" : d[c])));

  if (tab === "Contact") {
    // The site prefixes text starting with = + - @ with ' so the Sheet doesn't run it; drop that in the email.
    const plain = (v) => String(v || "").replace(/^'(?=[=+\-@])/, "");
    const opts = {
      to: SUPPORT_EMAIL,
      subject: "Ask Algeria: new contact message",
      body:
        plain(d.message) +
        "\n\n---\nReply to: " + (plain(d.replyTo) || "(no email given)") +
        "\nLanguage: " + (d.lang || "?") +
        "\nSent: " + (d.at || new Date().toISOString()) +
        "\nAll messages: " + ss.getUrl(),
    };
    if (d.replyTo) opts.replyTo = plain(d.replyTo);
    MailApp.sendEmail(opts);
  }
  return reply("ok");
}

function reply(text) {
  return ContentService.createTextOutput(text);
}
