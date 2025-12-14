const { app, BrowserWindow, ipcMain, shell, dialog } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');

let mainWindow;
let isIntroSkipped = false;

// ФИКС ДЛЯ ШРИФТОВ
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.commandLine.appendSwitch('--enable-font-antialiasing');

// Создаем окно анимации
function createIntroWindow() {
  const introWindow = new BrowserWindow({
    width: 800,
    height: 600,
    transparent: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    backgroundColor: '#000000',
    show: false,
    center: true
  });

  introWindow.loadFile('intro.html');
  
  introWindow.once('ready-to-show', () => {
    introWindow.show();
    
    setTimeout(() => {
      if (!isIntroSkipped && introWindow && !introWindow.isDestroyed()) {
        introWindow.close();
        createMainWindow();
      }
    }, 7000);
  });

  introWindow.on('closed', () => {
    createMainWindow();
  });
}

// Создаем основное окно
function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      defaultFontFamily: {
        standard: 'Arial',
        serif: 'Times New Roman',
        sansSerif: 'Arial',
        monospace: 'Courier New'
      }
    },
    icon: path.join(__dirname, 'assets', 'icon.ico'),
    backgroundColor: '#ffffff',
    show: false,
    frame: true,
    center: true,
    minWidth: 900,
    minHeight: 700
  });

  mainWindow.loadFile('index.html');
  
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Функция для получения информации о системе
function getSystemInfo() {
  return {
    platform: os.platform(),
    release: os.release(),
    arch: os.arch(),
    cpus: os.cpus().length,
    totalMem: Math.round(os.totalmem() / (1024 * 1024 * 1024)),
    freeMem: Math.round(os.freemem() / (1024 * 1024 * 1024)),
    hostname: os.hostname(),
    username: os.userInfo().username
  };
}

// Инициализация приложения
app.whenReady().then(() => {
  createIntroWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// ========== ОБРАБОТЧИКИ IPC ==========

// Анимация
ipcMain.handle('skip-intro', () => {
  return new Promise((resolve) => {
    isIntroSkipped = true;
    
    BrowserWindow.getAllWindows().forEach(window => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    
    setTimeout(() => {
      createMainWindow();
    }, 100);
    
    resolve('Анимация пропущена');
  });
});

ipcMain.handle('get-intro-status', () => {
  return new Promise((resolve) => {
    resolve({ skipped: isIntroSkipped });
  });
});

// Системная информация
ipcMain.handle('get-system-info', async () => {
  return getSystemInfo();
});

// Основные функции
ipcMain.handle('open-explorer', (event, folderPath) => {
  return new Promise((resolve, reject) => {
    const normalizedPath = folderPath.replace(/\//g, '\\');
    
    fs.access(normalizedPath, fs.constants.F_OK, (err) => {
      if (err) {
        fs.mkdir(normalizedPath, { recursive: true }, (mkdirErr) => {
          if (mkdirErr) {
            reject(`Ошибка создания папки: ${mkdirErr.message}`);
          } else {
            shell.openPath(normalizedPath);
            resolve(`Папка создана и открыта: ${normalizedPath}`);
          }
        });
      } else {
        shell.openPath(normalizedPath);
        resolve(`Папка открыта: ${normalizedPath}`);
      }
    });
  });
});

ipcMain.handle('open-task-manager', () => {
  return new Promise((resolve, reject) => {
    exec('taskmgr', (error) => {
      if (error) {
        reject(`Ошибка: ${error.message}`);
      } else {
        resolve('Диспетчер задач запущен');
      }
    });
  });
});

ipcMain.handle('sleep-computer', () => {
  return new Promise((resolve, reject) => {
    exec('rundll32.exe powrprof.dll,SetSuspendState 0,1,0', (error) => {
      if (error) {
        reject(`Ошибка: ${error.message}`);
      } else {
        resolve('Компьютер переведен в спящий режим');
      }
    });
  });
});

ipcMain.handle('run-batch-file', (event, batchPath) => {
  return new Promise((resolve, reject) => {
    const normalizedPath = batchPath.replace(/\//g, '\\');
    
    fs.access(normalizedPath, fs.constants.F_OK, (err) => {
      if (err) {
        const defaultBatchContent = `@echo off\necho Запуск Zapret...\npause`;
        const dir = path.dirname(normalizedPath);
        
        fs.mkdir(dir, { recursive: true }, (mkdirErr) => {
          if (mkdirErr) {
            reject(`Ошибка создания директории: ${mkdirErr.message}`);
          } else {
            fs.writeFile(normalizedPath, defaultBatchContent, (writeErr) => {
              if (writeErr) {
                reject(`Ошибка создания файла: ${writeErr.message}`);
              } else {
                exec(`start cmd /k "${normalizedPath}"`, (execError) => {
                  if (execError) {
                    reject(`Ошибка запуска: ${execError.message}`);
                  } else {
                    resolve(`Файл создан и запущен: ${normalizedPath}`);
                  }
                });
              }
            });
          }
        });
      } else {
        exec(`start cmd /k "${normalizedPath}"`, (error) => {
          if (error) {
            reject(`Ошибка запуска: ${error.message}`);
          } else {
            resolve(`Файл запущен: ${normalizedPath}`);
          }
        });
      }
    });
  });
});

// ========== ВСЕ ОСТАЛЬНЫЕ ФУНКЦИИ ==========

// Управление системой
ipcMain.handle('open-control-panel', () => execPromise('control', 'Панель управления открыта'));
ipcMain.handle('open-device-manager', () => execPromise('devmgmt.msc', 'Диспетчер устройств открыт'));
ipcMain.handle('open-system-properties', () => execPromise('sysdm.cpl', 'Свойства системы открыты'));
ipcMain.handle('open-computer-management', () => execPromise('compmgmt.msc', 'Управление компьютером открыто'));

// Инструменты
ipcMain.handle('clean-disk', () => execPromise('cleanmgr', 'Очистка диска запущена'));
ipcMain.handle('open-resource-monitor', () => execPromise('resmon', 'Монитор ресурсов открыт'));
ipcMain.handle('check-disk', () => {
  return new Promise((resolve, reject) => {
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Проверка диска',
        message: 'Для проверки диска C: будут запрошены права администратора. Продолжить?',
        buttons: ['Да', 'Нет']
      }).then((result) => {
        if (result.response === 0) {
          exec('powershell Start-Process cmd -ArgumentList \'/c "chkdsk C: /f"\' -Verb RunAs', (error) => {
            if (error) {
              reject(`Ошибка: ${error.message}`);
            } else {
              resolve('Проверка диска запущена. Перезагрузите компьютер для выполнения проверки.');
            }
          });
        } else {
          reject('Операция отменена');
        }
      });
    } else {
      reject('Главное окно не найдено');
    }
  });
});

ipcMain.handle('defragment-disk', () => execPromise('dfrgui', 'Оптимизация дисков открыта'));

// Служебные программы
ipcMain.handle('open-command-prompt', () => execPromise('cmd', 'Командная строка открыта'));
ipcMain.handle('open-powershell', () => execPromise('powershell', 'PowerShell открыт'));
ipcMain.handle('open-registry-editor', () => execPromise('regedit', 'Редактор реестра открыт'));
ipcMain.handle('open-task-scheduler', () => execPromise('taskschd.msc', 'Планировщик заданий открыт'));

// Дополнительные функции
ipcMain.handle('open-notepad', () => execPromise('notepad', 'Блокнот открыт'));
ipcMain.handle('open-calculator', () => execPromise('calc', 'Калькулятор открыт'));
ipcMain.handle('open-network-settings', () => execPromise('ncpa.cpl', 'Сетевые подключения открыты'));
ipcMain.handle('open-display-settings', () => execPromise('desk.cpl', 'Свойства экрана открыты'));

// Администрирование
ipcMain.handle('open-services', () => execPromise('services.msc', 'Службы Windows открыты'));
ipcMain.handle('open-event-viewer', () => execPromise('eventvwr.msc', 'Просмотр событий открыт'));
ipcMain.handle('open-power-options', () => execPromise('powercfg.cpl', 'Электропитание открыто'));
ipcMain.handle('open-on-screen-keyboard', () => execPromise('osk', 'Экранная клавиатура открыта'));

// Управление питанием
ipcMain.handle('restart-computer', () => execPromise('shutdown /r /t 0', 'Компьютер перезагружается'));
ipcMain.handle('shutdown-computer', () => execPromise('shutdown /s /t 0', 'Компьютер выключается'));

// Вспомогательная функция для промисов
function execPromise(command, successMessage) {
  return new Promise((resolve, reject) => {
    exec(command, (error) => {
      if (error) {
        reject(`Ошибка: ${error.message}`);
      } else {
        resolve(successMessage);
      }
    });
  });
}