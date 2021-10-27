class Command {
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
    console.log(`wait`);
  }
}

class SelectCommand extends Command {
  constructor(selectionSubject) {
    super();
    this.subject = selectionSubject;
  }

  execute() {
    console.log(`Selecting ${this.subject}`);
  }
}
class NavigateCommand extends Command {
  constructor(navigationSubject) {
    super();
    this.subject = navigationSubject;
  }

  execute() {
    console.log(`Navigating to ${this.subject}`);
  }
}

class ToggleCommand extends Command {
  constructor(toggleSubject) {
    super();
    this.subject = toggleSubject;
  }

  execute() {
    console.log(`Toggling ${this.subject}`);
  }
}

class GreetCommand extends Command {
  constructor(name) {
    super();
    this.name = name;
  }

  execute() {
    alert(`Hello, ${this.name}`);
  }
}
