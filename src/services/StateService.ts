import { Settings } from '../types';

class StateService {
  private settingsState!: Settings;

  setSettingState(settingState: Settings) {
    this.settingsState = { ...settingState };
  }

  getSettingsState(): Settings {
    return { ...this.settingsState };
  }
}

export const stateService = new StateService();
