function clearExistingTriggers() {
    var triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
            Utilities.sleep(5000);
            ScriptApp.deleteTrigger(triggers[i]);
    }
}