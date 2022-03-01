

Expression = (!Command ./Whitespace)* command:Command (!Command ./Whitespace)* { return command } //TODO: maybe fix whitespace logic

Command = SubjectCommand / DirectCommand
DirectCommand = NameCommand / StopCommand/CancelCommand/WaitCommand/ContinueCommand/BackCommand
SubjectCommand = NavigateCommand/ToggleCommand/SelectCommand/MediaCommand/AnswerCommand

//Navigate
// implicit verursacht Konflikte mit SelectCommand
NavigateCommand = NavigateCommandExplicit // /NavigateCommandImplicit
NavigateCommandExplicit = trigger:("navigate to"/"go to"/"navigiere zu"/"geh zu"/"gehe zu"/"wechsle zu"/"wechsel zu") Whitespace+ subject:NavigationSubject {
     return new NavigateCommand(trigger, subject) 
}
//NavigateCommandImplicit = subject:NavigationSubject { return new NavigateCommand(undefined, subject) }
NavigationSubject = "plagiat oder fehler"/"plagiatsformen"/"plagiatserkennung"/"plagiieren verhindern"/"wissen check"/"übersicht"/"einstellungen"/"home"/"impressum"/("kapitel 1"/"kapitel eins")/("kapitel 2"/"kapitel zwei")/("kapitel 3"/"kapitel drei")/("kapitel 4"/"kapitel vier")

StopCommand = trigger:("stoppen"/"stopp"/"stop"/"beenden") {return new StopCommand(trigger)}

CancelCommand = trigger:("cancel"/"abbrechen") {return new CancelCommand(trigger)}

WaitCommand = trigger:("wait"/"warte"/"warten") {return new WaitCommand(trigger)}

ContinueCommand = trigger:("continue"/"weiter") {return new ContinueCommand(trigger)}

BackCommand = trigger:("back"/"zurück") {return new BackCommand(trigger)}

//Toggle
ToggleCommand = ToggleCommandExplicit/ToggleCommandImplicit
ToggleCommandExplicit = trigger:("turn"/"schalte") Whitespace* subject:ToggleSubject Whitespace* toggleState:("on"/"ein"/"off"/"aus"/"an") { 
    return new ToggleCommand(trigger, subject, toggleState) 
}
ToggleCommandImplicit = subject:ToggleSubject Whitespace* toggleState:("on"/"ein"/"off"/"aus"/"an") { return new ToggleCommand(undefined, subject, toggleState) }
ToggleSubject = ("voice"/"sprache"/"sprachassistent"/"voice assistant"/"untertitel"/"menü"/"menu")

//Select
SelectCommand = SelectCommandExplicit/SelectCommandImplicit
SelectCommandExplicit = trigger:("wähle"/"selektiere"/"klicke"/"klick"/"click") Whitespace+ subject:SelectionSubject (Whitespace+ ("aus"/"an"))? {
     return new SelectCommand(trigger, subject) 
}
SelectCommandImplicit = subject:SelectionSubject { return new SelectCommand(undefined, subject) }
SelectionSubject = ("modus wählen"/"modul starten"/"plagiieren"/"plagiieren verhindern"/"informationen"/("sprachbefehle"/"sprach befehle")/"modus"/"name"/"anrede"/"ressourcen"/("video 1"/"video eins")/("video 2"/"video zwei")/"fortfahren"/"abschicken"/"bestätigen"/"alexa"/"bibi"/"harry")

NameCommand = trigger:("mein name ist") Whitespace+ name:Name { return new NameCommand(trigger, name.join('')) }
Name = ([a-zA-Z]*)
Whitespace = " "

MediaCommand = MediaCommandExplicit/MediaCommandImplicit
MediaCommandExplicit = trigger:MediaTrigger Whitespace+ subject:MediaSubject {
     return new MediaCommand(trigger, subject)
}
MediaCommandImplicit = trigger:MediaTrigger {return new MediaCommand(trigger, undefined)}
MediaSubject = ("video")
MediaTrigger = ("spiele"/"spiel"/"halte"/"stoppe"/"stopp"/"stop"/"play"/"pause"/"pausiere")

// Answer
AnswerCommand = AnswerCommandExplicit/AnswerCommandWithState/AnswerCommandImplicit
AnswerCommandExplicit = trigger:AnswerTrigger Whitespace+ subject:AnswerSubject Whitespace state:AnswerState { return new AnswerCommand(trigger, subject, state) }
AnswerCommandWithState = subject:AnswerSubject Whitespace state:AnswerState { return new AnswerCommand(undefined, subject, state) }
AnswerCommandImplicit = subject:AnswerSubject { return new AnswerCommand(undefined, subject, undefined) }
AnswerSubject = ("1"/"2"/"3"/"4"/"eins"/"zwei"/"drei"/"vier"/"fünf"/"richtig"/"falsch"/"ja"/"nein")
AnswerTrigger = ("antwort")
AnswerState = ("auswählen"/"abwählen")