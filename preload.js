const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Анимация
  skipIntro: () => ipcRenderer.invoke('skip-intro'),
  getIntroStatus: () => ipcRenderer.invoke('get-intro-status'),
  
  // Системная информация
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // Основные функции
  openExplorer: (folderPath) => ipcRenderer.invoke('open-explorer', folderPath),
  openTaskManager: () => ipcRenderer.invoke('open-task-manager'),
  sleepComputer: () => ipcRenderer.invoke('sleep-computer'),
  runBatchFile: (batchPath) => ipcRenderer.invoke('run-batch-file', batchPath),
  
  // Управление системой
  openControlPanel: () => ipcRenderer.invoke('open-control-panel'),
  openDeviceManager: () => ipcRenderer.invoke('open-device-manager'),
  cleanDisk: () => ipcRenderer.invoke('clean-disk'),
  openResourceMonitor: () => ipcRenderer.invoke('open-resource-monitor'),
  openSystemProperties: () => ipcRenderer.invoke('open-system-properties'),
  
  // Служебные программы
  openCommandPrompt: () => ipcRenderer.invoke('open-command-prompt'),
  openPowershell: () => ipcRenderer.invoke('open-powershell'),
  openRegistryEditor: () => ipcRenderer.invoke('open-registry-editor'),
  
  // Дополнительные функции
  openNotepad: () => ipcRenderer.invoke('open-notepad'),
  openCalculator: () => ipcRenderer.invoke('open-calculator'),
  
  // Управление питанием
  restartComputer: () => ipcRenderer.invoke('restart-computer'),
  shutdownComputer: () => ipcRenderer.invoke('shutdown-computer'),
  
  // Сеть и настройки
  openNetworkSettings: () => ipcRenderer.invoke('open-network-settings'),
  openOnScreenKeyboard: () => ipcRenderer.invoke('open-on-screen-keyboard'),
  openPowerOptions: () => ipcRenderer.invoke('open-power-options'),
  
  // Диски и обслуживание
  checkDisk: () => ipcRenderer.invoke('check-disk'),
  defragmentDisk: () => ipcRenderer.invoke('defragment-disk'),
  openDisplaySettings: () => ipcRenderer.invoke('open-display-settings'),
  
  // Администрирование
  openComputerManagement: () => ipcRenderer.invoke('open-computer-management'),
  openTaskScheduler: () => ipcRenderer.invoke('open-task-scheduler'),
  openEventViewer: () => ipcRenderer.invoke('open-event-viewer'),
  openServices: () => ipcRenderer.invoke('open-services')
});