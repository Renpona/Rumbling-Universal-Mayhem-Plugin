type Settings = {
    vtuber: VtuberSettings;
    intiface: IntifaceSettings;
}
type VtuberSettings = {
    protocol: string;
    host: string;
    port: number;
}
type IntifaceSettings = {
    useLocal?: boolean;
    host: string;
    port: number;
    vibration_multiplier?: number;
}

export { Settings, VtuberSettings, IntifaceSettings }