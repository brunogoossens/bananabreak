const { app, Menu, Tray } = require("electron");
const moment = require("moment");
const Notification = require("node-mac-notifier");
const path = require("path");

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
  const notification = new Notification("Time to bananabreak", {
    body: "Have a nice banana",
    otherButtonTitle: "Stop bothering me"
  });
  notification.addEventListener("click", () => {
    notification.close();
    nextNotification = getNextNotificationDate();
    startInterval();
  });
}

function startInterval() {
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
        rebuildMenu();
      }
    },
    {
      label: "Snooze 5 minutes",
      type: "normal",
      click: () => {
        nextNotification = moment().add(5, "minutes");
        rebuildMenu();
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

function getNextNotificationDate() {
  return moment().add(1, "hour");
}
