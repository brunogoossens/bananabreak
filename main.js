const { app, Menu, Tray, Notification } = require("electron");
const moment = require("moment");
const path = require("path");
let notification = false;
let appIcon = null;
let icon = path.join(__dirname, "/img/banana-small.png");
let contextMenu = Menu.buildFromTemplate([
  { label: "Starting", type: "normal" }
]);
let interval = false;
let nextNotification = getNextNotificationDate();

app.on("ready", () => {
  appIcon = new Tray(icon);
  rebuildMenu();
  startInterval();
});

function sendNotification() {
  notification = new Notification({
    title: "Time to bananabreak",
    body: "Have a nice banana",
    closeButtonText: "Done",
    timeoutType: "never",
    actions: {
      type: "button",
      text: "Snooze"
    }
  });

  notification.on("click", () => {
    nextNotification = getNextNotificationDate();
    startInterval();
  });
  notification.on("close", () => {
    nextNotification = getNextNotificationDate();
    startInterval();
  });
  notification.on("action", data => {
    console.log("action", data);
    snooze();
  });

  notification.show();
}

function startInterval() {
  clearInterval(interval);
  interval = setInterval(() => {
    if (nextNotification.isBefore(moment().subtract(5, "minutes"))) {
      // computer when to sleep for more then 5 minutes.
      nextNotification = getNextNotificationDate();
    } else if (nextNotification.isBefore(moment())) {
      clearInterval(interval);
      sendNotification();
    }
    rebuildMenu();
  }, 1000);
}

function rebuildMenu() {
  let timelabel = "";
  if (nextNotification.isBefore(moment())) {
    timelabel = "Have a nice banana!";
  } else {
    timelabel =
      "Next break " +
      moment().to(nextNotification) +
      " (" +
      nextNotification.diff(moment(), "minutes") +
      ":" +
      (nextNotification.diff(moment(), "seconds") % 60) +
      ")";
  }
  contextMenu = Menu.buildFromTemplate([
    {
      label: timelabel,
      type: "normal"
    },
    {
      type: "separator"
    },
    {
      label: "Reset timer",
      type: "normal",
      click: () => {
        nextNotification = getNextNotificationDate();
        startInterval();
        rebuildMenu();
      }
    },
    {
      label: "Snooze 5 minutes",
      type: "normal",
      click: () => {
        snooze();
      }
    },
    {
      type: "separator"
    },
    {
      label: "Quit",
      role: "quit"
    }
  ]);
  appIcon.setContextMenu(contextMenu);
}

function snooze() {
  if (notification) {
    notification.close();
  }
  nextNotification = moment().add(5, "minutes");
  startInterval();
  rebuildMenu();
}

function getNextNotificationDate() {
  return moment().add(1, "hour");
}
