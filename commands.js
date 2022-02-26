class Command {
  constructor(trigger) {
    this.trigger = trigger;
  }
  execute() {
    throw new Error("Missing implementation");
  }
}

class StopCommand extends Command {
  execute() {
    console.debug(`Stop Command`);
  }
}

class CancelCommand extends Command {
  execute() {
    console.debug(`Cancel Command`);
  }
}

class WaitCommand extends Command {
  execute() {
    console.debug(`Wait Command`);
  }
}

class ContinueCommand extends Command {
  execute() {
    console.debug(`Continue Command`);
    GetPlayer().SetVar("continue", true);
    GetPlayer().SetVar("continue", false);
  }
}

class BackCommand extends Command {
  execute() {
    console.debug(`Back Command`);
    GetPlayer().SetVar("back", true);
    GetPlayer().SetVar("back", false);
  }
}

class SelectCommand extends Command {
  constructor(trigger, selectionSubject) {
    super(trigger);
    this.subject = selectionSubject;
  }

  execute() {
    switch (this.subject) {
      case "eins":
        this.subject = "1";
        break;
      case "zwei":
        this.subject = "2";
        break;
      case "drei":
        this.subject = "3";
        break;
      case "vier":
        this.subject = "4";
        break;
      case "fünf":
        this.subject = "5";
        break;
      default:
        break;
    }
    console.debug(`Select Command:`, { subject: this.subject });
    GetPlayer().SetVar("selectSubject", this.subject);
    GetPlayer().SetVar("selectSubject", "");
  }
}
class NavigateCommand extends Command {
  constructor(trigger, navigationSubject) {
    super(trigger);
    this.subject = navigationSubject;
  }

  execute() {
    console.debug(`Navigate Command:`, { subject: this.subject });
    GetPlayer().SetVar("navigateSubject", this.subject);
    GetPlayer().SetVar("navigateSubject", ""); // null causes errors in Articulate
  }
}

class ToggleCommand extends Command {
  constructor(trigger, toggleSubject, toggleState) {
    super(trigger);
    this.subject = toggleSubject;
    this.toggleState = toggleState;
  }
  execute() {
    console.debug(
      `Toggle Command: ${{
        subject: this.subject,
        toggleState: this.toggleState,
      }}`
    );

    if (this.toggleState) {
      this.toggleState = this.getToggleState(this.toggleState);
    }

    if (
      ["voice", "sprache", "sprachassistent", "voice assistant"].includes(
        this.subject
      )
    ) {
      GetPlayer().SetVar("sttEnabled", this.toggleState ?? true);
    } else if (["untertitel"].includes(this.subject)) {
      const captions = document.getElementById("captions");
      if (captions) {
        const captionsState = this.getToggleState(
          captions.attributes.getNamedItem("aria-pressed").value
        );
        if (this.toggleState !== Boolean(captionsState)) {
          captions.click();
        }
      }
    } else if (["menü", "menu"].includes(this.subject)) {
      const menu = document.getElementById("hamburger");
      if (menu) {
        const menuState = this.getToggleState(
          menu.attributes.getNamedItem("aria-expanded").value
        );
        if (this.toggleState !== Boolean(menuState)) {
          menu.click();
        }
      }
    }
  }

  getToggleState(state) {
    switch (state) {
      case "on":
      case "ein":
      case "an":
      case "true":
        return true;

      case "aus":
      case "off":
      case "false":
        return false;

      default:
        return Boolean(toggleState);
    }
  }
}

class NameCommand extends Command {
  constructor(trigger, name) {
    super(trigger);
    this.name = name;
  }
  execute() {
    const arr = this.name.split(" ");
    for (var i = 0; i < arr.length; i++) {
      arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
    }
    this.name = arr.join(" ");

    console.debug(`Name Command:`, { name: this.name });
    GetPlayer().SetVar("userName", this.name);
  }
}

class MediaCommand extends Command {
  constructor(trigger, mediaSubject) {
    super(trigger);
    this.subject = mediaSubject;

    switch (trigger) {
      case "spiele":
      case "spiel":
      case "play":
        this.state = "play";
        break;

      case "halte":
      case "pause":
      case "pausiere":
        this.state = "pause";
        break;

      case "stop":
      case "stoppe":
        this.state = "stop";
        break;

      default:
        this.state = "stop";
        break;
    }
  }
  execute() {
    console.debug(`Media Command:`, {
      subject: this.subject,
      state: this.state,
    });
    if (this.subject === "video" || this.subject === "audio") {
      GetPlayer().SetVar(this.subject, this.state);
      GetPlayer().SetVar(this.subject, "");
    } else {
      GetPlayer().SetVar("video", this.state);
      GetPlayer().SetVar("audio", this.state);
      GetPlayer().SetVar("video", "");
      GetPlayer().SetVar("audio", "");
    }
  }
}

class AnswerCommand extends Command {
  constructor(trigger, subject, state) {
    super(trigger);
    this.subject = subject;
    this.state = state;
  }
  execute() {
    console.debug(`Answer Command:`, {
      subject: this.subject,
      trigger: this.trigger,
      state: this.state,
    });

    if (this.state === "abwählen") {
      GetPlayer().SetVar("unselectQuizAnswer", this.subject);
      GetPlayer().SetVar("unselectQuizAnswer", "");
      return;
    }

    GetPlayer().SetVar("givenQuizAnswer", this.subject);
    GetPlayer().SetVar("givenQuizAnswer", "");
  }
}
