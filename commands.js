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
    console.log(`wait`);
  }
}

class BackCommand extends Command {
  execute() {
    console.log(`back`);
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
    console.log(`Hello, ${this.name}`);
  }
}
