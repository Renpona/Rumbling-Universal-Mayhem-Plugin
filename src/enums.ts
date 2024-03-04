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

enum ConnectionStatus {
    NotConnected = "Not Connected",
    Connecting = "Connecting",
    Connected = "Connected",
    Disconnected = "Disconnected",
    Error = "Error"
}

export { ExitCode, FormType, ConnectionStatus };