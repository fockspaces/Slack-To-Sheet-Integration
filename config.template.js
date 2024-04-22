const CHANNELS = ['CHANNEL_ID_1', 'CHANNEL_ID_2'];
const USER_MAPPING = {
    '<@USER_ID_1>': 'Name1',
    '<@USER_ID_2>': 'Name2'
};
const WORKSPACE_URL = 'https://yourworkspace.slack.com/archives';
const SHEET_NAME = 'ticket';
const DEFAULT_NOTE = "See message content for details";
const DEFAULT_SEVERITY = 1;
const INITIAL_CHECKBOX_STATE = false;
const CHECKBOX_COLUMN_INDEX = 9;
const EMPTY_FIELD = null;
const FAKE_EVENT = {
    "contentLength": 937,
    "postData": {
        "contents": "...",
        "length": 937,
        "name": "postData",
        "type": "application/json"
    },
    "parameters": {},
    "queryString": "",
    "contextPath": "",
    "parameter": {}
}

function getFakeEvent() {
    return FAKE_EVENT;
}