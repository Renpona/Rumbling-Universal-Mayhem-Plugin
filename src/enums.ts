enum ExitCode {
    Standard = 0,
    UnknownError = 1,
    ConfigReadFailed = 2,
    IncorrectConfigValue = 3,
    IntifaceConnectionFailed = 4,
    VtuberConnectionFailed = 5
}

enum FormType {
    Intiface = "intiface",
    Vtuber = "vtuber"
}

enum Protocol {
    VtubeStudio = "VTubeStudio",
    Vnyan = "VNyan",
    Warudo = "Warudo"
}

enum ConnectionStatus {
    NotConnected = "Not Connected",
    Connecting = "Connecting",
    Connected = "Connected",
    Disconnected = "Disconnected",
    Error = "Error"
}

enum ActionCheck {
    None = 0,
    Exit = 1,
    Entry = 2
}

enum DbStores {
    SavedActions = "savedActions"
}

export { ExitCode, FormType, Protocol, ConnectionStatus, ActionCheck, DbStores };