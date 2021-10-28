

Expression = (!Command ./Whitespace)* command:Command (!Command ./Whitespace)* { return command }

Command = SubjectCommand / DirectCommand
DirectCommand = StopCommand/CancelCommand/WaitCommand/ContinueCommand/BackCommand
SubjectCommand = NavigateCommand/ToggleCommand/SelectCommand

//Navigate
NavigateCommand = NavigateCommandExplicit/NavigateCommandImplicit
NavigateCommandExplicit = trigger:("navigate to"/"go to"/"navigiere zu"/"geh zu"/"gehe zu"/"wechsle zu"/"wechsel zu") Whitespace+ subject:NavigationSubject {
     return new NavigateCommand(trigger, subject) 
}
NavigateCommandImplicit = subject:NavigationSubject { return new NavigateCommand(undefined, subject) }
NavigationSubject = "befehle"/"help"/"hilfe"/"home"/"übersicht"/"start"/("sitemap"/"site map")/"impressum"

StopCommand = trigger:("stoppen"/"stopp"/"stop"/"beenden") {return new StopCommand(trigger)}

CancelCommand = trigger:("cancel"/"abbrechen") {return new CancelCommand(trigger)}

WaitCommand = trigger:("wait"/"warte"/"warten") {return new WaitCommand(trigger)}

ContinueCommand = trigger:("continue"/"weiter") {return new ContinueCommand(trigger)}

BackCommand = trigger:("back"/"zurück") {return new BackCommand(trigger)}

ToggleCommand = trigger:("turn"/"schalte") Whitespace* subject:ToggleSubject Whitespace* toggleState:("on"/"ein"/"off"/"aus"/"an") { 
    return new ToggleCommand(trigger, subject, toggleState) 
}

ToggleSubject = ("voice"/"sprache")

//Select
SelectCommand = SelectCommandExplicit/SelectCommandImplicit
SelectCommandExplicit = trigger:("wähle"/"selektiere"/"klicke"/"klick"/"click") Whitespace+ subject:SelectionSubject (Whitespace+ ("aus"/"an"))? {
     return new SelectCommand(trigger, subject) 
}
SelectCommandImplicit = subject:SelectionSubject { return new SelectCommand(undefined, subject) }
SelectionSubject = ("recherchetipps"/"recherche tipps"/"recherche"/"zitieren"/"plagiieren"/"grundlagen des wissenschaftlichen arbeitens"/"suchstrategie"/"suchtools"/"qualität"/"quiz"/"videos")

Whitespace = " "