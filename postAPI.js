function doPost(e) {
    if (!e) {
        e = getFakeEvent()
    }
    const params = JSON.parse(e.postData.contents);

    if (params.type === "url_verification") {
        return handleUrlVerification(params);
    }

    if (isMessageEvent(params)) {
        return handleMessageEvent(params);
    }

    return ContentService.createTextOutput('ok');
}

function handleUrlVerification(params) {
    console.log('URL verification requested.');
    return ContentService.createTextOutput(params.challenge);
}

function isMessageEvent(params) {
    return params.event && params.event.type === "message";
}

function handleMessageEvent(params) {
    console.log('Received a message event.');
    if (isRelevantMessage(params.event)) {
        logToSheet(params.event);
        return ContentService.createTextOutput('Message logged.');
    }
    return ContentService.createTextOutput('Message ignored.');
}

function isRelevantMessage(event) {
    const isFromBot = event.subtype !== 'bot_message';
    const isFromChannels = CHANNELS.includes(event.channel);
    const isUserMentioned = getFirstMentionedUser(event.text);
    return isFromBot && isFromChannels && isUserMentioned;
}

function getFirstMentionedUser(text) {
    const mentionUsers = Object.keys(USER_MAPPING);
    const mentionRegex = new RegExp(mentionUsers.join('|'), 'g');
    const matches = text.match(mentionRegex);
    return matches ? matches[0] : null;
}

function logToSheet(event) {
    const sheet = getOrCreateSheet(SHEET_NAME);
    const rowData = extractEventData(event);
    appendRowToSheet(sheet, rowData);
}

function appendRowToSheet(sheet, rowData) {
    sheet.appendRow(rowData);
    insertCheckboxInLastResolvedColumn(sheet);
}

function insertCheckboxInLastResolvedColumn(sheet) {
    const lastRowIndex = sheet.getLastRow();
    const range = sheet.getRange(lastRowIndex, CHECKBOX_COLUMN_INDEX);
    range.insertCheckboxes();
    range.setValue(INITIAL_CHECKBOX_STATE);
}

function getOrCreateSheet(sheetName) {
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
        console.log('Sheet not found, creating new sheet:', sheetName);
        sheet = SpreadsheetApp.getActiveSpreadsheet().createSheet(sheetName);
    }
    return sheet;
}

function extractEventData(event) {
    const slackMessageLink = constructSlackMessageLink(event.channel, event.event_ts);
    const messageLink = `=HYPERLINK("${slackMessageLink}", "HELPER")`

    const date = new Date(parseFloat(event.event_ts) * 1000);
    const month = Utilities.formatDate(date, "GMT", "yyyy-MM");
    const formattedDate = Utilities.formatDate(date, "GMT", "yyyy/MM/dd");

    const messageText = event.text;
    const processedMessageText = replaceUserMentionsWithNames(event.text);

    const firstMentionedUser = getFirstMentionedUser(event.text);
    const owner = USER_MAPPING[firstMentionedUser];

    return [
        messageLink,
        month,
        formattedDate,
        EMPTY_FIELD,
        DEFAULT_SEVERITY,
        processedMessageText,
        owner,
        EMPTY_FIELD,
        EMPTY_FIELD,
        DEFAULT_NOTE,
        EMPTY_FIELD,
        EMPTY_FIELD
    ];
}

function replaceUserMentionsWithNames(text) {
    const userIdsPattern = new RegExp(Object.keys(USER_MAPPING).join('|'), 'g');
    return text.replace(userIdsPattern, matchedId => USER_MAPPING[matchedId] || matchedId);
}

function constructSlackMessageLink(channelId, eventTs) {
    const messageTimestamp = (parseFloat(eventTs) * 1000000).toString();
    return `${WORKSPACE_URL}/${channelId}/p${messageTimestamp}`;
}