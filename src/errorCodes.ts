enum ExitCode {
    Standard = 0,
    UnknownError = 1,
    ConfigReadFailed = 2,
    IncorrectConfigValue = 3,
    IntifaceConnectionFailed = 4,
    VtuberConnectionFailed = 5
}

export { ExitCode };