

Expression = (!Command ./Whitespace)* command:Command (!Command ./Whitespace)* { return command }

Command = SubjectCommand / DirectCommand
DirectCommand = NameCommand / StopCommand/CancelCommand/WaitCommand/ContinueCommand/BackCommand
SubjectCommand = NavigateCommand/ToggleCommand/SelectCommand/MediaCommand

//Navigate
NavigateCommand = NavigateCommandExplicit/NavigateCommandImplicit
NavigateCommandExplicit = trigger:("navigate to"/"go to"/"navigiere zu"/"geh zu"/"gehe zu"/"wechsle zu"/"wechsel zu") Whitespace+ subject:NavigationSubject {
     return new NavigateCommand(trigger, subject) 
}
NavigateCommandImplicit = subject:NavigationSubject { return new NavigateCommand(undefined, subject) }
NavigationSubject = "befehle"/"help"/"hilfe"/"recherche"/"gute wissenschaftliche praxis"/"zitieren"/"plagiieren"/"home"/"übersicht"/"start"/("sitemap"/"site map")/"impressum"/"test"

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
ToggleSubject = ("voice"/"sprache"/"sprachassistent"/"voice assistant")

//Select
SelectCommand = SelectCommandExplicit/SelectCommandImplicit
SelectCommandExplicit = trigger:("wähle"/"selektiere"/"klicke"/"klick"/"click") Whitespace+ subject:SelectionSubject (Whitespace+ ("aus"/"an"))? {
     return new SelectCommand(trigger, subject) 
}
SelectCommandImplicit = subject:SelectionSubject { return new SelectCommand(undefined, subject) }
SelectionSubject = ("recherchetipps"/"recherche tipps"/"grundlagen des wissenschaftlichen arbeitens"/"suchstrategie"/"suchtools"/"qualität"/"quiz"/"videos")

NameCommand = trigger:("mein name ist") Whitespace+ name:Name { return new NameCommand(trigger, name.join('')) }
Name = ([a-zA-Z]*)
Whitespace = " "

MediaCommand = MediaCommandExplicit/MediaCommandImplicit
MediaCommandExplicit = trigger:MediaTrigger Whitespace+ subject:MediaSubject {
     return new MediaCommand(trigger, subject)
}
MediaCommandImplicit = trigger:MediaTrigger {return new MediaCommand(trigger, undefined)}
MediaSubject = ("linkes video"/"rechtes video")
MediaTrigger = ("spiele"/"spiel"/"halte"/"stop"/"pausiere"/"play"/"pause")