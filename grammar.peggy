

Expression = (!Command ./Whitespace)* command:Command (!Command ./Whitespace)* { return command }
Command = NavigateCommand/StopCommand/CancelCommand/WaitCommand/ContinueCommand/BackCommand/ToggleCommand/SelectCommand

//Navigate
NavigateCommand = NavigateCommandExplicit/NavigateCommandImplicit
NavigateCommandExplicit = ("navigate to"/"go to"/"navigiere zu"/("geh"("e")?" zu")/"wechsle zu") Whitespace+ subject:NavigationSubject {
     return new NavigateCommand(subject) 
}
NavigateCommandImplicit = subject:NavigationSubject{return new NavigateCommand(subject)}
NavigationSubject = "befehle"/"help"/"hilfe"/"home"/"übersicht"/"start"/("sitemap"/"site map")/"impressum"

StopCommand = "stop"/"beenden" {return new StopCommand()}

CancelCommand = "cancel"/"abbrechen" {return new CancelCommand()}

WaitCommand = "wait"/"warte"/"warten" {return new WaitCommand()}

ContinueCommand = "continue"/"weiter" {return new ContinueCommand()}

BackCommand = "back"/"zurück" {return new NavigateCommand("back")}

ToggleCommand = ("turn"/"schalte") Whitespace* subject:ToggleSubject Whitespace* ("on"/"ein"/"off"/"aus"/"an") { 
    return new ToggleCommand(subject) 
}

ToggleSubject = ("voice"/"sprache")

//Select
SelectCommand = SelectCommandExplicit/SelectCommandImplicit
SelectCommandExplicit = ("wähle"/"selektiere") Whitespace+ subject:SelectionSubject (Whitespace+ "aus")? {
     return new SelectCommand(subject) 
}
SelectCommandImplicit = subject:SelectionSubject
SelectionSubject = ("recherche"/"zitieren"/"plagiieren"/"grundlagen des wissenschaftlichen arbeitens"/"recherchetipps"/"recherce tipps"/"suchstrategie"/"suchtools"/"qualität"/"quiz"/"videos")

Whitespace = " "