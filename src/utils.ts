const pluginName = "Rumbling Universal Mayhem Plugin";

function errorHalt(message: string, exitCode = 1, error?: Error) {
    console.error(message);
    if (error) console.error(error);
    process.exit(exitCode);
}

export { pluginName, errorHalt };