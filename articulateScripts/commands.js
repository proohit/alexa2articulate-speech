class Command {
  constructor(trigger) {
    this.trigger = trigger;
  }
  execute() {
    throw new Error('Missing implementation');
  }
}

class StopCommand extends Command {
  execute() {
    console.log(`stop`);
  }
}

class CancelCommand extends Command {
  execute() {
    console.log(`cancel`);
  }
}

class WaitCommand extends Command {
  execute() {
    console.log(`wait`);
  }
}

class ContinueCommand extends Command {
  execute() {
    console.log(`continue`);
    GetPlayer().SetVar("continue", true);
    GetPlayer().SetVar("continue", false);
  }
}

class BackCommand extends Command {
  execute() {
    console.log(`back`);
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
    console.log(`Selecting ${this.subject}`);
  }
}
class NavigateCommand extends Command {
  constructor(trigger, navigationSubject) {
    super(trigger);
    this.subject = navigationSubject;
  }

  execute() {
    console.log(`Navigating to ${this.subject}`);
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
    console.log(`Setting ${this.subject} to ${this.toggleState}`);
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

    console.log(`Hello, ${this.name}`);
    GetPlayer().SetVar("userName", this.name);
  }
}
